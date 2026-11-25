"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type Verdict = "push" | "wind" | "rest";

type Props = {
  name?: string;
  verdict: Verdict;
  headline: string;
  detail: string;
  stats?: { label: string; value: string }[];
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

const STYLES: Record<Verdict, { panel: string; badge: string; title: string }> = {
  push: { panel: "kolo-briefing-push", badge: "Go hard today — fill your strain target", title: "Push" },
  wind: { panel: "kolo-briefing-wind", badge: "Target hit. Sleep is next.", title: "Wind down" },
  rest: { panel: "kolo-briefing-rest", badge: "Recover today — protect the baseline", title: "Rest" },
};

export function BriefingCard({
  name = "there",
  verdict,
  headline,
  detail,
  stats = [],
  ctaHref = "/train",
  ctaLabel = "Got it",
  className,
}: Props) {
  const s = STYLES[verdict];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className={cn("relative overflow-hidden rounded-[1.75rem] p-5 text-white shadow-lg sm:p-6", s.panel, className)}>
      <p className="text-sm/none opacity-90">{greeting}, {name}</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{s.title}</h2>
      <p className="mt-1 text-sm opacity-90">{s.badge}</p>
      <p className="mt-4 text-sm font-medium">{headline}</p>
      <p className="mt-1 text-sm opacity-85">{detail}</p>
      {stats.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((st) => (
            <div key={st.label} className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wide opacity-80">{st.label}</p>
              <p className="text-sm font-semibold tabular-nums">{st.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <Link
        href={ctaHref}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-white/95 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
