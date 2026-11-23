const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEV_USER_ID = "local-dev-user";

const DEFAULT_SUPPLEMENTS = ["creatine", "vitamin_c", "vitamin_d"];

const DEFAULT_GOALS = [
  { type: "protein", target: 205, period: "daily" },
  { type: "calories", target: 2273, period: "daily" },
  { type: "office_hours", target: 9, period: "daily" },
  { type: "gym_sessions", target: 3, period: "weekly" },
];

async function main() {
  // Dev user (matches the src/lib/auth.ts fallback when Clerk is not configured)
  const user = await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: {
      id: DEV_USER_ID,
      email: "dev@local.test",
      name: "Local Dev",
    },
  });

  // User-defined supplements (replaces the old hard-coded three)
  for (const name of DEFAULT_SUPPLEMENTS) {
    await prisma.supplement.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { userId: user.id, name },
    });
  }

  // Configurable goals (Phase 3 groundwork)
  for (const goal of DEFAULT_GOALS) {
    await prisma.goal.upsert({
      where: { userId_type: { userId: user.id, type: goal.type } },
      update: { target: goal.target },
      create: { userId: user.id, ...goal },
    });
  }

  // Sample entry (idempotent: only seed when there is no data yet)
  const existing = await prisma.dailyEntry.findFirst({
    where: { userId: user.id, deletedAt: null },
  });
  if (!existing) {
    const supplements = await prisma.supplement.findMany({
      where: { userId: user.id, name: { in: DEFAULT_SUPPLEMENTS } },
    });
    const byName = Object.fromEntries(supplements.map((s) => [s.name, s.id]));

    await prisma.dailyEntry.create({
      data: {
        userId: user.id,
        date: new Date(),
        timeInOffice: 8,
        calories: 2000,
        protein: 120,
        bodyWeight: 170,
        gripStrength: 50,
        sleepHours: 7.5,
        sleepQuality: 4,
        mood: 4,
        energy: 4,
        activities: "Initial setup",
        improvements: "First deployment",
        supplements: {
          create: DEFAULT_SUPPLEMENTS.filter((n) => byName[n]).map((name) => ({
            supplementId: byName[name],
            taken: true,
          })),
        },
        gymSession: {
          create: {
            type: "push",
            exercises: {
              create: [
                { name: "Flat Bench Press", weight: 135, reps: 10, order: 0 },
                { name: "Incline Dumbbell Press", weight: 95, reps: 10, order: 1 },
              ],
            },
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
