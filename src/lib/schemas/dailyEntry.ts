import { z } from "zod";

// ── Gym ──────────────────────────────────────────────────────────────────────

export const GYM_SESSION_TYPES = ["push", "pull", "legs & shoulder", "other"] as const;
export type GymSessionType = (typeof GYM_SESSION_TYPES)[number];

// ── Shared bounds ────────────────────────────────────────────────────────────

export const MAX_SUPPLEMENTS_PER_ENTRY = 50;
const SUPPLEMENT_NAME_MAX = 40;

// Entry ids are cuid()s; this also rejects anything exotic before it reaches the DB.
export const entryIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid id");

// Names are trimmed + length-capped and the map is size-capped, so one request
// can never create unbounded supplement rows.
const supplementMapSchema = z
  .record(z.string().trim().min(1).max(SUPPLEMENT_NAME_MAX), z.boolean())
  .refine(
    (m) => Object.keys(m).length <= MAX_SUPPLEMENTS_PER_ENTRY,
    `At most ${MAX_SUPPLEMENTS_PER_ENTRY} supplements per entry`
  );

// Entries are day-granular. Allow up to 2 days ahead to absorb timezone skew.
const MIN_ENTRY_TIME = Date.UTC(2000, 0, 1);
const MAX_FUTURE_MS = 2 * 24 * 60 * 60 * 1000;
const isPlausibleEntryDate = (d: Date) =>
  d.getTime() >= MIN_ENTRY_TIME && d.getTime() <= Date.now() + MAX_FUTURE_MS;

// Form variant: numeric fields arrive as strings, leave as numbers.
const exerciseFormSchema = z.object({
  id: z.string(), // client-side field-array id, stripped server-side
  name: z.string().trim().min(1, "Exercise name is required").max(80),
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine((v) => Number.isFinite(Number(v)), "Weight must be a number")
    .refine((v) => Number(v) >= 0 && Number(v) <= 1000, "Weight must be 0–1000")
    .transform((v) => Number(v)),
  reps: z
    .string()
    .min(1, "Reps is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 500, "Reps must be a whole number (0–500)")
    .transform((v) => Number(v)),
  order: z.number().int().min(0),
});

const gymSessionFormSchema = z.object({
  type: z.enum(GYM_SESSION_TYPES),
  exercises: z.array(exerciseFormSchema).max(20, "20 exercises max"),
});

// ── Field helpers ("" means "not filled", transforms to null) ────────────────

const optionalNumber = (max: number, label: string) =>
  z
    .string()
    .refine(
      (v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= max),
      `${label} must be between 0 and ${max}`
    )
    .transform((v) => (v === "" ? null : Number(v)));

const optionalRating = (label: string) =>
  z
    .string()
    .refine((v) => v === "" || ["1", "2", "3", "4", "5"].includes(v), `${label} must be 1–5 or empty`)
    .transform((v) => (v === "" ? null : Number(v)));

const requiredNumber = (max: number, label: string, integer: boolean) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((v) => Number.isFinite(Number(v)), `${label} must be a number`)
    .refine((v) => Number(v) >= 0 && Number(v) <= max, `${label} must be between 0 and ${max}`)
    .refine((v) => !integer || Number.isInteger(Number(v)), `${label} must be a whole number`)
    .transform((v) => Number(v));

// ── Daily entry: form schema (strings in → typed values out) ─────────────────
// This is the single contract shared by the form (zodResolver) and the Server
// Action (which re-validates with dailyEntryInputSchema below).

export const dailyEntryFormSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeInOffice: requiredNumber(24, "Office hours", false),
  calories: requiredNumber(20000, "Calories", true),
  protein: requiredNumber(1000, "Protein", true),
  bodyWeight: optionalNumber(700, "Body weight"),
  gripStrength: optionalNumber(200, "Grip strength"),
  // Phase 2 recovery + mood fields
  sleepHours: optionalNumber(24, "Sleep hours"),
  sleepQuality: optionalRating("Sleep quality"),
  mood: optionalRating("Mood"),
  energy: optionalRating("Energy"),
  notes: z.string().max(2000, "Keep notes under 2000 characters"),
  activities: z.string().max(2000, "Keep activities under 2000 characters"),
  improvements: z.string().max(2000, "Keep improvements under 2000 characters"),
  // user-defined supplements: name -> taken
  supplements: supplementMapSchema,
  gymSession: gymSessionFormSchema.nullable(),
});

export type DailyEntryFormValues = z.input<typeof dailyEntryFormSchema>;
export type DailyEntryFormOutput = z.output<typeof dailyEntryFormSchema>;

// ── Daily entry: server schema (accepts JSON or transformed form values) ─────

const coerceOptional = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).max(max).nullable()
  );

const coerceOptionalInt = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(0).max(max).nullable()
  );

export const dailyEntryInputSchema = z.object({
  date: z.coerce.date().refine(isPlausibleEntryDate, "Date is out of range"),
  timeInOffice: z.coerce.number().min(0).max(24),
  calories: z.coerce.number().int().min(0).max(20000),
  protein: z.coerce.number().int().min(0).max(1000),
  bodyWeight: coerceOptional(700),
  gripStrength: coerceOptional(200),
  sleepHours: coerceOptional(24),
  sleepQuality: coerceOptionalInt(5),
  mood: coerceOptionalInt(5),
  energy: coerceOptionalInt(5),
  notes: z.string().max(2000).nullish(),
  activities: z.string().max(2000).nullish(),
  improvements: z.string().max(2000).nullish(),
  supplements: supplementMapSchema.default({}),
  gymSession: z
    .object({
      type: z.enum(GYM_SESSION_TYPES),
      exercises: z
        .array(
          z.object({
            name: z.string().trim().min(1).max(80),
            weight: z.coerce.number().min(0).max(1000),
            reps: z.coerce.number().int().min(0).max(500),
            order: z.coerce.number().int().min(0).default(0),
          })
        )
        .max(20),
    })
    .nullish(),
});

export type DailyEntryInput = z.output<typeof dailyEntryInputSchema>;

// ── Presets (Phase 2: one-tap pre-fill) ──────────────────────────────────────

export type Preset = {
  id: string;
  label: string;
  description: string;
  apply: {
    timeInOffice: string;
    calories: string;
    protein: string;
    supplements: Record<string, boolean>;
    gymSession: { type: GymSessionType; exercises: { id: string; name: string; weight: string; reps: string; order: number }[] } | null;
  };
};

export const PRESETS: Preset[] = [
  {
    id: "rest",
    label: "Rest day",
    description: "No office, no gym",
    apply: {
      timeInOffice: "0",
      calories: "",
      protein: "",
      supplements: {},
      gymSession: null,
    },
  },
  {
    id: "office-gym",
    label: "Office + gym",
    description: "9h office, creatine, ready for exercises",
    apply: {
      timeInOffice: "9",
      calories: "",
      protein: "",
      supplements: { creatine: true },
      gymSession: { type: "push", exercises: [] },
    },
  },
  {
    id: "travel",
    label: "Travel",
    description: "No office, body-weight log only",
    apply: {
      timeInOffice: "0",
      calories: "",
      protein: "",
      supplements: {},
      gymSession: null,
    },
  },
];
