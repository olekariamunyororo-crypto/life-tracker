import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getFuel() {
  const userId = await getSessionUserId(); // AuthError propagates: fail-closed
  try {
    return await prisma.dailyEntry.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { date: "desc" },
      include: { supplements: { include: { supplement: true } } },
    });
  } catch {
    return null;
  }
}

export default async function FuelPage() {
  const entry = await getFuel();
  const calories = entry?.calories ?? 0;
  const protein = entry?.protein ?? 0;
  const calorieGoal = 2200;
  const proteinGoal = 160;
  const calPct = Math.min(100, Math.round((calories / calorieGoal) * 100));
  const proPct = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const supplements = entry?.supplements?.length
    ? entry.supplements
    : [
        { id: "1", taken: false, supplement: { name: "creatine" } },
        { id: "2", taken: false, supplement: { name: "vitamin_d" } },
        { id: "3", taken: false, supplement: { name: "vitamin_c" } },
      ];

  return (
    <div className="kolo-page space-y-4">
      <header className="kolo-enter flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--kolo-muted)]">
            Fuel for the day&apos;s load
          </p>
          <h1 className="kolo-section-title mt-1">Fuel</h1>
        </div>
        <Link href="/log" className="rounded-full bg-[var(--kolo-accent)] px-4 py-2 text-sm font-semibold text-white">
          Log meal
        </Link>
      </header>
      <div className="kolo-enter kolo-enter-delay-1 kolo-card-lg p-5">
        <p className="kolo-metric-label">Today&apos;s intake</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums">{calories || "—"}</p>
            <p className="text-xs text-[var(--kolo-muted)]">/ {calorieGoal} kcal</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div className="h-full rounded-full bg-[var(--kolo-accent)]" style={{ width: `${calPct}%` }} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-semibold tabular-nums">
              {protein || "—"}
              <span className="text-base font-medium text-[var(--kolo-muted)]">g</span>
            </p>
            <p className="text-xs text-[var(--kolo-muted)]">/ {proteinGoal}g protein</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${proPct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="kolo-enter kolo-enter-delay-2 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-lg">
        <p className="text-xs font-medium uppercase tracking-wide opacity-90">Fuel for strength</p>
        <p className="mt-2 text-lg font-semibold">
          Carbs before, protein after — time it around your session.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
            <p className="text-[10px] uppercase opacity-80">Before 16:30</p>
            <p className="text-xl font-semibold">40g</p>
            <p className="text-xs opacity-90">carbs</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
            <p className="text-[10px] uppercase opacity-80">After 19:15</p>
            <p className="text-xl font-semibold">35g</p>
            <p className="text-xs opacity-90">protein</p>
          </div>
        </div>
      </div>
      <div className="kolo-enter kolo-enter-delay-3 grid grid-cols-2 gap-3">
        <div className="kolo-card p-4">
          <p className="kolo-metric-label">Water</p>
          <p className="mt-1 text-2xl font-semibold">1.2</p>
          <p className="text-xs text-[var(--kolo-muted)]">/ 3.0 L</p>
        </div>
        <div className="kolo-card p-4">
          <p className="kolo-metric-label">Caffeine</p>
          <p className="mt-1 text-2xl font-semibold">
            95<span className="text-sm font-medium text-[var(--kolo-muted)]"> mg</span>
          </p>
          <p className="text-xs text-[var(--kolo-muted)]">last cup by 14:00</p>
        </div>
      </div>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Supplements</h3>
        <div className="kolo-card divide-y divide-[var(--kolo-border)]">
          {supplements.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium capitalize">{s.supplement.name.replace(/_/g, " ")}</p>
              <span
                className={
                  s.taken
                    ? "kolo-pill bg-emerald-100 text-emerald-800"
                    : "kolo-pill bg-black/5 text-[var(--kolo-muted)] dark:bg-white/10"
                }
              >
                {s.taken ? "Taken" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
