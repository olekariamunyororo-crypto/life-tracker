import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyEntryInput } from "../schemas/dailyEntry";

const tx = vi.hoisted(() => ({
  dailyEntry: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  supplement: { findMany: vi.fn(), createMany: vi.fn(), count: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
  supplementLog: { deleteMany: vi.fn() },
  gymSession: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  gymExercise: { deleteMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: tx }));

import {
  LimitError,
  MAX_SUPPLEMENTS_PER_USER,
  addSupplement,
  createEntry,
  softDeleteEntry,
  updateEntry,
} from "../repositories/dailyEntry";

const input = (over: Partial<DailyEntryInput> = {}): DailyEntryInput =>
  ({
    date: new Date("2026-11-21"),
    timeInOffice: 8,
    calories: 2000,
    protein: 150,
    bodyWeight: null,
    gripStrength: null,
    sleepHours: null,
    sleepQuality: null,
    mood: null,
    energy: null,
    notes: null,
    activities: null,
    improvements: null,
    supplements: {},
    gymSession: null,
    ...over,
  }) as DailyEntryInput;

beforeEach(() => {
  vi.resetAllMocks();
  tx.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) => fn(tx));
});

describe("softDeleteEntry", () => {
  it("is a single conditional update scoped to owner and not-yet-deleted", async () => {
    tx.dailyEntry.updateMany.mockResolvedValue({ count: 1 });
    await expect(softDeleteEntry("e1", "u1")).resolves.toEqual({ id: "e1" });
    expect(tx.dailyEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "e1", userId: "u1", deletedAt: null } })
    );
  });

  it("returns null for someone else's (or an already-deleted) entry — IDOR guard", async () => {
    tx.dailyEntry.updateMany.mockResolvedValue({ count: 0 });
    await expect(softDeleteEntry("e1", "attacker")).resolves.toBeNull();
  });
});

describe("updateEntry", () => {
  it("does nothing and returns null when the entry is not owned by the caller", async () => {
    tx.dailyEntry.findFirst.mockResolvedValue(null);
    await expect(updateEntry("e1", "attacker", input())).resolves.toBeNull();
    expect(tx.dailyEntry.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "e1", userId: "attacker", deletedAt: null } })
    );
    expect(tx.supplementLog.deleteMany).not.toHaveBeenCalled();
    expect(tx.dailyEntry.update).not.toHaveBeenCalled();
  });

  it("deletes a removed gym session's exercises BEFORE the session (gym_exercise FK is ON DELETE RESTRICT)", async () => {
    tx.dailyEntry.findFirst.mockResolvedValue({ id: "e1" });
    tx.dailyEntry.update.mockResolvedValue({ id: "e1" });
    await updateEntry("e1", "u1", input({ gymSession: null }));
    const exerciseOrder = tx.gymExercise.deleteMany.mock.invocationCallOrder[0];
    const sessionOrder = tx.gymSession.deleteMany.mock.invocationCallOrder[0];
    expect(exerciseOrder).toBeDefined();
    expect(exerciseOrder).toBeLessThan(sessionOrder);
  });

  it("re-asserts ownership on the write itself", async () => {
    tx.dailyEntry.findFirst.mockResolvedValue({ id: "e1" });
    tx.dailyEntry.update.mockResolvedValue({ id: "e1" });
    await updateEntry("e1", "u1", input());
    expect(tx.dailyEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "e1", userId: "u1", deletedAt: null } })
    );
  });

  it("maps 'row vanished mid-transaction' (P2025) to null instead of a 500", async () => {
    tx.dailyEntry.findFirst.mockResolvedValue({ id: "e1" });
    tx.dailyEntry.update.mockRejectedValue(Object.assign(new Error("gone"), { code: "P2025" }));
    await expect(updateEntry("e1", "u1", input())).resolves.toBeNull();
  });
});

describe("supplement resolution (via createEntry)", () => {
  it("uses a constant number of queries and a race-safe createMany for new names", async () => {
    tx.supplement.findMany
      .mockResolvedValueOnce([]) // existing
      .mockResolvedValueOnce([
        { id: "s1", name: "creatine" },
        { id: "s2", name: "zinc" },
      ]); // after createMany
    tx.dailyEntry.create.mockResolvedValue({ id: "e1" });
    await createEntry("u1", input({ supplements: { creatine: true, zinc: false } }));
    expect(tx.supplement.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ skipDuplicates: true })
    );
    expect(tx.supplement.findMany).toHaveBeenCalledTimes(2);
    const data = tx.dailyEntry.create.mock.calls[0][0].data;
    expect(data.supplements.create).toEqual([
      { supplementId: "s1", taken: true },
      { supplementId: "s2", taken: false },
    ]);
  });

  it("refuses to grow a user's supplement list past the cap", async () => {
    const existing = Array.from({ length: MAX_SUPPLEMENTS_PER_USER - 1 }, (_, i) => ({ id: `s${i}`, name: `n${i}` }));
    tx.supplement.findMany.mockResolvedValueOnce(existing);
    await expect(
      createEntry("u1", input({ supplements: { a: true, b: true } }))
    ).rejects.toBeInstanceOf(LimitError);
    expect(tx.dailyEntry.create).not.toHaveBeenCalled();
  });
});

describe("addSupplement", () => {
  it("reports an existing supplement instead of failing on the unique index", async () => {
    tx.supplement.count.mockResolvedValue(3);
    tx.supplement.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    tx.supplement.findFirst.mockResolvedValue({ id: "s1", name: "creatine" });
    await expect(addSupplement("u1", "creatine")).resolves.toEqual({
      created: false,
      supplement: { id: "s1", name: "creatine" },
    });
  });

  it("enforces the per-user cap", async () => {
    tx.supplement.count.mockResolvedValue(MAX_SUPPLEMENTS_PER_USER);
    await expect(addSupplement("u1", "x")).rejects.toBeInstanceOf(LimitError);
  });
});
