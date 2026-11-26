import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function getHealth() {
  const userId = await getSessionUserId();
  try {
    return await prisma.dailyEntry.findMany({
      where: { userId, deletedAt: null },
      orderBy: { date: "desc" },
      take: 14,
    });
  } catch {
    return [];
  }
}

export default async function HealthPage() {
  const entries = await getHealth();
  const latest = entries[0];
  const weights = entries.filter((e) => e.bodyWeight != null).map((e) => e.bodyWeight as number);
  const grips = entries.filter((e) => e.gripStrength != null).map((e) => e.gripStrength as number);

  const cards = [
    { label: "Body weight", value: latest?.bodyWeight != null ? `${latest.bodyWeight}` : "—", unit: "kg", hint: weights.length > 1 ? `${weights.length} readings` : "Log weight", tone: "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200" },
    { label: "Grip strength", value: latest?.gripStrength != null ? `${latest.gripStrength}` : "—", unit: "kg", hint: grips.length ? "Latest" : "Add measurement", tone: "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" },
    { label: "Sleep quality", value: latest?.sleepQuality != null ? `${latest.sleepQuality}` : "—", unit: "/5", hint: "Last night", tone: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200" },
    { label: "Energy", value: latest?.energy != null ? `${latest.energy}` : "—", unit: "/5", hint: "Subjective", tone: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" },
    { label: "Mood", value: latest?.mood != null ? `${latest.mood}` : "—", unit: "/5", hint: "Subjective", tone: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200" },
    { label: "Office load", value: latest?.timeInOffice != null ? `${latest.timeInOffice}` : "—", unit: "h", hint: "Today / latest", tone: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" },
  ];

  return (
    <div className="kolo-page space-y-4">
      <header className="kolo-enter">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--kolo-muted)]">
          Signals vs your baseline
        </p>
        <h1 className="kolo-section-title mt-1">Health</h1>
      </header>
      <div className="kolo-enter kolo-enter-delay-1 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`kolo-card p-4 ${c.tone}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {c.value}<span className="text-sm font-medium opacity-70"> {c.unit}</span>
            </p>
            <p className="mt-1 text-[11px] opacity-70">{c.hint}</p>
          </div>
        ))}
      </div>
      <section className="kolo-enter kolo-enter-delay-2 kolo-card p-4">
        <p className="kolo-metric-label">Sleep consistency</p>
        <p className="mt-1 text-sm text-[var(--kolo-muted)]">Last {Math.min(7, entries.length)} nights logged</p>
        <div className="mt-4 flex h-24 items-end gap-1.5">
          {entries.length === 0
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-[var(--kolo-border)]" style={{ height: "20%" }} />
                </div>
              ))
            : entries.slice(0, 7).reverse().map((e) => {
                const h = e.sleepHours ?? 0;
                const pct = Math.min(100, (h / 9) * 100);
                return (
                  <div key={e.id} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-[var(--kolo-sleep)]" style={{ height: `${Math.max(8, pct)}%` }} />
                    <span className="text-[9px] text-[var(--kolo-muted)]">{format(new Date(e.date), "EEEEE")}</span>
                  </div>
                );
              })}
        </div>
      </section>
      <p className="text-center text-xs text-[var(--kolo-muted)]">
        Changes show up early when you log weight, grip, sleep and energy daily.
      </p>
    </div>
  );
}
