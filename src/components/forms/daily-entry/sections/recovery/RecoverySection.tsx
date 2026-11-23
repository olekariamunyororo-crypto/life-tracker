"use client";

// Phase 2: sleep + subjective recovery. All optional — a skipped day stays valid.
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyEntryFormInstance } from "../../state/types";

interface RecoverySectionProps {
  form: DailyEntryFormInstance;
}

const RATINGS = [
  { name: "sleepQuality", label: "Sleep quality" },
  { name: "mood", label: "Mood" },
  { name: "energy", label: "Energy" },
] as const;

function RatingSelect({
  label,
  registration,
}: {
  label: string;
  registration: ReturnType<DailyEntryFormInstance["register"]>;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <Label className="mb-2 block">{label}</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        {...registration}
      >
        <option value="">Not tracked</option>
        <option value="1">1 — Poor</option>
        <option value="2">2 — Below average</option>
        <option value="3">3 — Average</option>
        <option value="4">4 — Good</option>
        <option value="5">5 — Excellent</option>
      </select>
    </div>
  );
}

export default function RecoverySection({ form }: RecoverySectionProps) {
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50/40 to-cyan-50/30 dark:from-sky-950/30 dark:to-cyan-950/30 border border-sky-100/30 dark:border-sky-900/50">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Sleep &amp; Recovery
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <Label htmlFor="sleepHours" className="mb-2 block">
            Sleep hours
          </Label>
          <Input
            type="number"
            id="sleepHours"
            step="0.25"
            min="0"
            max="24"
            placeholder="7.5"
            aria-invalid={Boolean(errors.sleepHours)}
            {...register("sleepHours")}
          />
          {errors.sleepHours && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.sleepHours.message}
            </p>
          )}
        </div>
        {RATINGS.map((r) => (
          <RatingSelect key={r.name} label={r.label} registration={register(r.name)} />
        ))}
        <div className="md:col-span-2">
          <Label htmlFor="notes" className="mb-2 block">
            Notes (optional)
          </Label>
          <Input
            type="text"
            id="notes"
            placeholder="Anything worth remembering about today"
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
