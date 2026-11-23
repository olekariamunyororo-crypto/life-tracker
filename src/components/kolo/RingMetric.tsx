"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
  sublabel?: string;
  className?: string;
};

export function RingMetric({
  value,
  max = 100,
  size = 88,
  stroke = 8,
  color,
  label,
  sublabel,
  className,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = c - (pct / 100) * c;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            className="kolo-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums leading-none">
            {Math.round(value)}
            <span className="text-xs font-medium text-[var(--kolo-muted)]">%</span>
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium">{label}</p>
        {sublabel ? (
          <p className="text-[10px] text-[var(--kolo-muted)]">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}
