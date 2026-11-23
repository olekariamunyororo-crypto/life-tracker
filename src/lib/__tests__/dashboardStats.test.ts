import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyEntry } from "@/types/dashboard";
import { calculateCurrentStreaks } from "@/components/dashboard/goal-achievement/utils/statsCalculators";
import { getWeeklyGymSessions } from "@/components/dashboard/goal-achievement/utils/gymSessionUtils";
import { getLatestBodyWeight } from "@/components/dashboard/gym-progress/utils/calculations";
import { sortEntriesByDate, addDisplayLabels } from "@/components/dashboard/weekly-overview/utils/dataTransformers";

const entry = (date: string, over: Partial<DailyEntry> = {}): DailyEntry =>
  ({
    id: date,
    date: new Date(date),
    createdAt: new Date(date),
    timeInOffice: 9,
    calories: 2000,
    protein: 205,
    gymSession: null,
    ...over,
  }) as unknown as DailyEntry;

describe("calculateCurrentStreaks", () => {
  it("counts consecutive hits back from the most recent entry and stops at the first miss", () => {
    const entries = [
      entry("2026-11-21"), // newest: hit
      entry("2026-11-20"), // hit
      entry("2026-11-19", { protein: 100 }), // protein miss ends the protein streak
      entry("2026-11-18"), // hit again, but not part of the CURRENT streak
    ];
    const s = calculateCurrentStreaks(entries);
    expect(s.proteinStreak).toBe(2);
    expect(s.timeStreak).toBe(4);
    expect(s.caloriesStreak).toBe(4);
  });

  it("is 0 when the most recent entry missed the goal (old code reported the oldest run)", () => {
    const entries = [entry("2026-11-21", { timeInOffice: 2 }), entry("2026-11-20"), entry("2026-11-19")];
    expect(calculateCurrentStreaks(entries).timeStreak).toBe(0);
  });

  it("does not mutate its input", () => {
    const entries = [entry("2026-11-19"), entry("2026-11-21"), entry("2026-11-20")];
    const before = entries.map((e) => e.id);
    calculateCurrentStreaks(entries);
    expect(entries.map((e) => e.id)).toEqual(before);
  });

  it("handles an empty list", () => {
    expect(calculateCurrentStreaks([])).toEqual({ timeStreak: 0, caloriesStreak: 0, proteinStreak: 0 });
  });
});

describe("getLatestBodyWeight", () => {
  it("returns the newest weight without reordering the caller's array", () => {
    const sessions = [
      { type: "push", exercises: [], date: new Date("2026-11-10"), bodyWeight: 170, createdAt: new Date() },
      { type: "push", exercises: [], date: new Date("2026-11-20"), bodyWeight: 172, createdAt: new Date() },
    ];
    const order = sessions.map((s) => s.bodyWeight);
    expect(getLatestBodyWeight(sessions)).toBe(172);
    expect(sessions.map((s) => s.bodyWeight)).toEqual(order);
  });
});

describe("getWeeklyGymSessions", () => {
  afterEach(() => vi.useRealTimers());

  it("counts sessions in the current Monday-Sunday week and computes the weekly success rate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 19, 12, 0, 0)); // Thu 19 Nov 2026, local
    const gym = { id: "g", type: "push", exercises: [] };
    const entries = [
      entry("2026-11-16", { gymSession: gym }), // Mon (this week)
      entry("2026-11-18", { gymSession: gym }), // Wed (this week)
      entry("2026-11-22", { gymSession: gym }), // Sun (this week)
      entry("2026-11-12", { gymSession: gym }), // previous week
      entry("2026-11-17"), // no session
    ];
    const stats = getWeeklyGymSessions(entries);
    expect(stats.currentWeekSessions).toBe(3);
    expect(stats.weeklySuccessRate).toBe(50); // this week hit 3, last week hit 1
  });
});

describe("weekly overview ordering", () => {
  it("orders and labels by the entry's own date, not when it was typed in", () => {
    const backfilled = entry("2026-11-05", { createdAt: new Date("2026-11-21T10:00:00Z") });
    const recent = entry("2026-11-20", { createdAt: new Date("2026-11-20T08:00:00Z") });
    const sorted = sortEntriesByDate([recent, backfilled]);
    expect(sorted.map((e) => e.id)).toEqual(["2026-11-05", "2026-11-20"]);
    expect(addDisplayLabels(sorted).map((e) => e.displayLabel)).toEqual(["Nov 5", "Nov 20"]);
  });
});
