import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function getGymData() {
  try {
    return await prisma.dailyEntry.findMany({
      where: { deletedAt: null, gymSession: { isNot: null } },
      orderBy: { date: "desc" },
      take: 14,
      include: { gymSession: { include: { exercises: { orderBy: { order: "asc" } } } } },
    });
  } catch {
    return [];
  }
}

export default async function TrainPage() {
  const entries = await getGymData();
  const today = entries[0];
  const session = today?.gymSession;

  return (
    <div className="kolo-page space-y-4">
      <header className="kolo-enter">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--kolo-muted)]">
          Training that follows recovery
        </p>
        <h1 className="kolo-section-title mt-1">Train</h1>
      </header>
      <div className="kolo-enter kolo-enter-delay-1 grid grid-cols-2 gap-3">
        <div className="kolo-card p-4">
          <p className="kolo-metric-label">Sessions (14d)</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{entries.length}</p>
        </div>
        <div className="kolo-card p-4">
          <p className="kolo-metric-label">Last type</p>
          <p className="mt-1 text-xl font-semibold capitalize">{session?.type ?? "—"}</p>
        </div>
      </div>
      <div className="kolo-enter kolo-enter-delay-2 kolo-card-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="kolo-metric-label">Today</p>
            <h2 className="mt-1 text-lg font-semibold">
              {session ? `Strength · ${session.type}` : "No session logged"}
            </h2>
            {today ? (
              <p className="text-sm text-[var(--kolo-muted)]">{format(new Date(today.date), "EEE, MMM d")}</p>
            ) : null}
          </div>
          <Link href="/log" className="rounded-full bg-[var(--kolo-accent)] px-4 py-2 text-sm font-semibold text-white">
            {session ? "Edit" : "Start"}
          </Link>
        </div>
        {session?.exercises?.length ? (
          <ul className="mt-5 space-y-2">
            {session.exercises.map((ex) => (
              <li key={ex.id} className="flex items-center justify-between rounded-2xl bg-[var(--kolo-bg)] px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-[var(--kolo-muted)]">{ex.reps} reps</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {ex.weight}<span className="text-xs font-normal text-[var(--kolo-muted)]"> kg</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--kolo-muted)]">
            Plan the load before you train, see what it cost after. Log a gym session to fill this card.
          </p>
        )}
      </div>
      <section className="kolo-enter kolo-enter-delay-3 space-y-2">
        <h3 className="text-sm font-semibold">Recent sessions</h3>
        {entries.length === 0 ? (
          <div className="kolo-card p-4 text-sm text-[var(--kolo-muted)]">
            No gym sessions yet.{" "}
            <Link href="/log" className="font-medium text-[var(--kolo-accent)]">Log one</Link>
          </div>
        ) : (
          entries.slice(0, 8).map((e) => (
            <div key={e.id} className="kolo-card flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium capitalize">{e.gymSession?.type}</p>
                <p className="text-xs text-[var(--kolo-muted)]">
                  {format(new Date(e.date), "MMM d")} · {e.gymSession?.exercises?.length ?? 0} exercises
                </p>
              </div>
              <span className="kolo-pill bg-[var(--kolo-strain-soft)] text-pink-700">Strain</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
