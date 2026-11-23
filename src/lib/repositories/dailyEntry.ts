import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { DailyEntryInput } from "@/lib/schemas/dailyEntry";

// Repository-style data access. Every function scopes by userId so ownership
// is enforced in one place (server actions + API routes both go through here).

export const MAX_SUPPLEMENTS_PER_USER = 50;

/** Thrown when a per-user resource cap would be exceeded. */
export class LimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LimitError";
  }
}

function errorCode(error: unknown): string | undefined {
  return (error as { code?: string } | null)?.code;
}

export const entryInclude = {
  supplements: {
    include: { supplement: true },
  },
  gymSession: {
    include: { exercises: { orderBy: { order: "asc" as const } } },
  },
} as const;

type EntryInclude = typeof entryInclude;

export type DailyEntryWithRelations = Prisma.DailyEntryGetPayload<{
  include: EntryInclude;
}>;

/**
 * Resolve supplement names to ids, creating any that are missing.
 * Race-safe (createMany + skipDuplicates relies on the (userId, name) unique
 * index) and constant-query-count instead of 2 queries per name.
 */
async function resolveSupplementIds(
  tx: Prisma.TransactionClient,
  userId: string,
  names: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const result = new Map<string, string>();
  if (unique.length === 0) return result;

  const existing = await tx.supplement.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const known = new Map<string, string>(
    existing.map((s): [string, string] => [s.name, s.id])
  );
  const missing = unique.filter((n) => !known.has(n));

  if (existing.length + missing.length > MAX_SUPPLEMENTS_PER_USER) {
    throw new LimitError(`You can track at most ${MAX_SUPPLEMENTS_PER_USER} supplements.`);
  }

  if (missing.length > 0) {
    await tx.supplement.createMany({
      data: missing.map((name) => ({ userId, name })),
      skipDuplicates: true,
    });
    const created = await tx.supplement.findMany({
      where: { userId, name: { in: missing } },
      select: { id: true, name: true },
    });
    for (const s of created) known.set(s.name, s.id);
  }

  for (const name of unique) {
    const id = known.get(name);
    if (id) result.set(name, id);
  }
  return result;
}

function scalarData(data: DailyEntryInput) {
  return {
    date: data.date,
    timeInOffice: data.timeInOffice,
    calories: data.calories,
    protein: data.protein,
    bodyWeight: data.bodyWeight ?? null,
    gripStrength: data.gripStrength ?? null,
    sleepHours: data.sleepHours ?? null,
    sleepQuality: data.sleepQuality ?? null,
    mood: data.mood ?? null,
    energy: data.energy ?? null,
    notes: data.notes ?? null,
    activities: data.activities ?? null,
    improvements: data.improvements ?? null,
  };
}

function supplementLogs(data: DailyEntryInput, ids: Map<string, string>) {
  return Object.entries(data.supplements ?? {}).flatMap(([name, taken]) => {
    const supplementId = ids.get(name.trim());
    return supplementId ? [{ supplementId, taken }] : [];
  });
}

function exerciseRows(data: DailyEntryInput) {
  return (data.gymSession?.exercises ?? []).map((ex, index) => ({
    name: ex.name,
    weight: ex.weight,
    reps: ex.reps,
    order: ex.order ?? index,
  }));
}

export async function getRecentEntries(userId: string, take = 30) {
  return prisma.dailyEntry.findMany({
    where: { userId, deletedAt: null },
    include: entryInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getEntryById(id: string, userId: string) {
  return prisma.dailyEntry.findFirst({
    where: { id, userId, deletedAt: null },
    include: entryInclude,
  });
}

export async function createEntry(userId: string, data: DailyEntryInput) {
  return prisma.$transaction(async (tx) => {
    const ids = await resolveSupplementIds(tx, userId, Object.keys(data.supplements ?? {}));
    return tx.dailyEntry.create({
      data: {
        ...scalarData(data),
        user: { connect: { id: userId } },
        supplements: { create: supplementLogs(data, ids) },
        gymSession: data.gymSession
          ? { create: { type: data.gymSession.type, exercises: { create: exerciseRows(data) } } }
          : undefined,
      },
      include: entryInclude,
    });
  });
}

/** Returns null when the entry does not exist, is deleted, or is not owned by userId. */
export async function updateEntry(id: string, userId: string, data: DailyEntryInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Ownership check and supplement resolution happen inside the same
      // transaction as the write, so nothing is left behind if it fails.
      const owned = await tx.dailyEntry.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!owned) return null;

      const ids = await resolveSupplementIds(tx, userId, Object.keys(data.supplements ?? {}));
      const exercises = exerciseRows(data);

      // Supplements: replace the whole log (small table, keeps semantics simple)
      await tx.supplementLog.deleteMany({ where: { entryId: id } });

      // Gym session: replace exercises, or remove the session entirely
      if (data.gymSession) {
        const existing = await tx.gymSession.findUnique({ where: { entryId: id } });
        if (existing) {
          await tx.gymExercise.deleteMany({ where: { sessionId: existing.id } });
          await tx.gymSession.update({
            where: { id: existing.id },
            data: { type: data.gymSession.type, exercises: { create: exercises } },
          });
        } else {
          await tx.gymSession.create({
            data: { entryId: id, type: data.gymSession.type, exercises: { create: exercises } },
          });
        }
      } else {
        await tx.gymExercise.deleteMany({ where: { session: { entryId: id } } });
        await tx.gymSession.deleteMany({ where: { entryId: id } });
      }

      // Re-assert ownership + not-deleted on the write itself (no check-then-act gap).
      return tx.dailyEntry.update({
        where: { id, userId, deletedAt: null },
        data: {
          ...scalarData(data),
          supplements: { create: supplementLogs(data, ids) },
        },
        include: entryInclude,
      });
    });
  } catch (error) {
    // P2025: the row was soft-deleted / removed between the check and the write.
    if (errorCode(error) === "P2025") return null;
    throw error;
  }
}

// Soft delete (keeps history recoverable); hard delete stays available via prisma directly.
// A single conditional UPDATE: atomic, scoped to the owner, idempotent.
export async function softDeleteEntry(id: string, userId: string) {
  const { count } = await prisma.dailyEntry.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return count > 0 ? { id } : null;
}

export async function listSupplements(userId: string) {
  return prisma.supplement.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Adds a supplement; `created: false` means it already existed. */
export async function addSupplement(userId: string, name: string) {
  const select = { id: true, name: true } as const;
  const count = await prisma.supplement.count({ where: { userId } });
  if (count >= MAX_SUPPLEMENTS_PER_USER) {
    throw new LimitError(`You can track at most ${MAX_SUPPLEMENTS_PER_USER} supplements.`);
  }
  try {
    const supplement = await prisma.supplement.create({ data: { userId, name }, select });
    return { created: true as const, supplement };
  } catch (error) {
    if (errorCode(error) !== "P2002") throw error;
    const supplement = await prisma.supplement.findFirst({ where: { userId, name }, select });
    if (!supplement) throw error;
    return { created: false as const, supplement };
  }
}
