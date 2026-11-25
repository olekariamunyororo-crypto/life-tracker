"use client";

import { format } from "date-fns";
import { RingMetric } from "./RingMetric";
import { SleepChart } from "./SleepChart";
import { BriefingCard, type Verdict } from "./BriefingCard";
import { cn } from "@/lib/utils";

export type TodaySnapshot = {
  recovery: number;
  strain: number;
  strainTarget?: number;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  energy?: number | null;
  mood?: number | null;
  gymType?: string | null;
  calories?: number | null;
  protein?: number | null;
  name?: string;
};

function deriveVerdict(s: TodaySnapshot): Verdict {
  if (s.recovery >= 67 && s.strain < 70) return "push";
  if (s.strain >= 85 || s.recovery < 40) return "wind";
  if (s.recovery < 55) return "rest";
  return "push";
}

export function TodayView({ data }: { data: TodaySnapshot }) {
  const verdict = deriveVerdict(data);
  const dateLabel = format(new Date(), "EEE, MMM d");
  const strainPct = Math.min(100, Math.round((data.strain / (data.strainTarget ?? 14)) * 100));

  return (
    <div className="kolo-page space-y-4">
      <header className="kolo-enter flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--kolo-muted)]">{dateLabel}</p>
          <h1 className="kolo-section-title mt-1">Today</h1>
        </div>
        <span className="kolo-pill bg-black/5 text-[var(--kolo-ink)] dark:bg-white/10">
          {verdict === "push" ? "Ready to push" : verdict === "wind" ? "Wind down" : "Recover"}
        </span>
      </header>

      <BriefingCard
        className="kolo-enter kolo-enter-delay-1"
        name={data.name}
        verdict={verdict}
        headline={
          verdict === "push"
            ? data.gymType ? `Strength · ${data.gymType}` : "Strength · Upper body at 18:00"
            : verdict === "wind"
              ? "Hard session done"
              : "Keep load light"
        }
        detail={
          verdict === "push"
            ? "HRV above baseline. Light day yesterday — you have room to train."
            : verdict === "wind"
              ? "Strain target hit. No caffeine after 14:00. Protect sleep."
              : "Recovery is low. Prioritize sleep and easy movement."
        }
        stats={[
          { label: "Recovery", value: `${Math.round(data.recovery)}%` },
          {
            label: "Sleep",
            value:
              data.sleepHours != null
                ? `${Math.floor(data.sleepHours)}h ${Math.round((data.sleepHours % 1) * 60)}m`
                : "—",
          },
          { label: "Energy", value: data.energy != null ? `${data.energy}/5` : "—" },
        ]}
        ctaHref={verdict === "wind" ? "/fuel" : "/train"}
        ctaLabel={verdict === "wind" ? "Plan bedtime" : "Open Train"}
      />

      <div className="kolo-enter kolo-enter-delay-2 grid grid-cols-2 gap-3">
        <div className="kolo-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="kolo-metric-label">Recovery</p>
            <span
              className={cn(
                "kolo-pill",
                data.recovery >= 67
                  ? "bg-[var(--kolo-recovery-soft)] text-emerald-700"
                  : data.recovery >= 40
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-700"
              )}
            >
              {data.recovery >= 67 ? "High" : data.recovery >= 40 ? "Med" : "Low"}
            </span>
          </div>
          <RingMetric value={data.recovery} color="var(--kolo-recovery)" label="" size={100} stroke={9} />
          <p className="mt-2 text-center text-[11px] text-[var(--kolo-muted)]">HRV vs baseline</p>
        </div>
        <div className="kolo-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="kolo-metric-label">Strain</p>
            <span className="kolo-pill bg-[var(--kolo-strain-soft)] text-pink-700">of target</span>
          </div>
          <RingMetric value={strainPct} color="var(--kolo-strain)" label="" size={100} stroke={9} />
          <p className="mt-2 text-center text-[11px] text-[var(--kolo-muted)]">
            {data.strain.toFixed(1)} / {data.strainTarget ?? 14} · optimal band
          </p>
        </div>
      </div>

      <div className="kolo-enter kolo-enter-delay-3">
        <SleepChart hours={data.sleepHours} quality={data.sleepQuality} />
      </div>

      <div className="kolo-card grid grid-cols-2 gap-3 p-4">
        <div>
          <p className="kolo-metric-label">Calories</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{data.calories ?? "—"}</p>
        </div>
        <div>
          <p className="kolo-metric-label">Protein</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {data.protein != null ? `${data.protein}g` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
