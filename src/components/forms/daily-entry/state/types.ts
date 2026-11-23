import type { UseFormReturn } from "react-hook-form";
import type { DailyEntryFormOutput, DailyEntryFormValues } from "@/lib/schemas/dailyEntry";
import type { DailyEntry } from "@/types/dashboard";

// Re-export the Zod-derived form type — it is the single source of truth.
export type { DailyEntryFormValues };
export type { Preset } from "@/lib/schemas/dailyEntry";

// The RHF instance every section receives (shadcn-style control pattern:
// sections call form.register / form.watch / form.setValue directly).
export type DailyEntryFormInstance = UseFormReturn<DailyEntryFormValues, unknown, DailyEntryFormOutput>;

// Component Props
export interface DailyEntryFormProps {
  initialData?: DailyEntry; // edit mode
  onSuccess?: () => void; // callback after successful submit
  mode?: "create" | "edit";
}

// One exercise row in the form (weight/reps stay strings until submit transforms them)
export interface ExerciseRow {
  id: string;
  name: string;
  weight: string;
  reps: string;
  order: number;
}

// Goals used by the form's progress rings (dashboard GOALS live in the goal model)
export const GOALS = {
  timeInOffice: 9, // hours
  calories: 2273, // max calories
  protein: 205, // grams
} as const;

// Fallback supplement list when the DB is unreachable (matches prisma/seed.js)
export const DEFAULT_SUPPLEMENT_NAMES = ["creatine", "vitamin_c", "vitamin_d"] as const;
