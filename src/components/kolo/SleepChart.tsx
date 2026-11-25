"use client";

type Props = {
  hours?: number | null;
  quality?: number | null;
  bedtime?: string;
};

const STAGES = [2, 1, 1, 3, 2, 1, 3, 2, 4, 2, 1, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2];
const COLORS: Record<number, string> = {
  1: "#4f46e5",
  2: "#818cf8",
  3: "#c4b5fd",
  4: "#fb7185",
};

export function SleepChart({ hours, quality, bedtime = "22:50" }: Props) {
  const score =
    quality != null
      ? Math.round((quality / 5) * 100)
      : hours != null
        ? Math.min(100, Math.round((hours / 8) * 100))
        : null;
  const duration =
    hours != null
      ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`
      : "—";

  return (
    <div className="kolo-card p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="kolo-metric-label">Sleep</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="kolo-metric-value">
              {score != null ? score : "—"}
              {score != null ? (
                <span className="text-base font-medium text-[var(--kolo-muted)]">%</span>
              ) : null}
            </span>
            <span className="text-sm text-[var(--kolo-muted)]">{duration}</span>
          </div>
        </div>
        <span className="kolo-pill bg-[var(--kolo-sleep-soft)] text-[var(--kolo-sleep)]">
          Bed by {bedtime}
        </span>
      </div>
      <div className="mb-2 flex h-16 items-end gap-[3px]">
        {STAGES.map((stage, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${stage * 22}%`,
              background: COLORS[stage],
              opacity: score == null ? 0.35 : 1,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--kolo-muted)]">
        <span>23:30</span>
        <span>03:00</span>
        <span>07:00</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[var(--kolo-muted)]">
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full" style={{ background: COLORS[4] }} /> Awake
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full" style={{ background: COLORS[3] }} /> REM
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full" style={{ background: COLORS[2] }} /> Light
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full" style={{ background: COLORS[1] }} /> Deep
        </span>
      </div>
    </div>
  );
}
