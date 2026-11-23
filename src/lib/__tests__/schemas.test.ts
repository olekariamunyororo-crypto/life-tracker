import { describe, it, expect } from "vitest";
import {
  dailyEntryFormSchema,
  dailyEntryInputSchema,
  PRESETS,
} from "../schemas/dailyEntry";

const validFormValues = {
  date: "2026-11-21",
  timeInOffice: "8.5",
  calories: "2200",
  protein: "180",
  bodyWeight: "170.5",
  gripStrength: "52",
  sleepHours: "7.5",
  sleepQuality: "4",
  mood: "4",
  energy: "3",
  notes: "",
  activities: "Deep work block",
  improvements: "Earlier bedtime",
  supplements: { creatine: true, vitamin_c: false },
  gymSession: {
    type: "push" as const,
    exercises: [
      { id: "x", name: "Flat Bench Press", weight: "135", reps: "10", order: 0 },
    ],
  },
};

describe("dailyEntryFormSchema (client form contract)", () => {
  it("accepts a fully valid entry and transforms strings to numbers", () => {
    const result = dailyEntryFormSchema.parse(validFormValues);
    expect(result.timeInOffice).toBe(8.5);
    expect(result.calories).toBe(2200);
    expect(result.bodyWeight).toBe(170.5);
    expect(result.sleepQuality).toBe(4);
    expect(result.gymSession?.exercises[0].weight).toBe(135);
  });

  it("transforms empty optional fields to null", () => {
    const result = dailyEntryFormSchema.parse({
      ...validFormValues,
      bodyWeight: "",
      gripStrength: "",
      sleepHours: "",
      sleepQuality: "",
      mood: "",
      energy: "",
    });
    expect(result.bodyWeight).toBeNull();
    expect(result.gripStrength).toBeNull();
    expect(result.sleepHours).toBeNull();
    expect(result.sleepQuality).toBeNull();
    expect(result.mood).toBeNull();
    expect(result.energy).toBeNull();
  });

  it("rejects out-of-range office hours", () => {
    const result = dailyEntryFormSchema.safeParse({ ...validFormValues, timeInOffice: "25" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric calories", () => {
    const result = dailyEntryFormSchema.safeParse({ ...validFormValues, calories: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty exercise name", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validFormValues,
      gymSession: {
        type: "push" as const,
        exercises: [{ id: "x", name: "", weight: "100", reps: "8", order: 0 }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gym session type", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validFormValues,
      gymSession: { type: "cardio", exercises: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects mood outside 1-5", () => {
    const result = dailyEntryFormSchema.safeParse({ ...validFormValues, mood: "7" });
    expect(result.success).toBe(false);
  });
});

describe("dailyEntryInputSchema (server contract)", () => {
  it("accepts the transformed form output", () => {
    const formOutput = dailyEntryFormSchema.parse(validFormValues);
    const result = dailyEntryInputSchema.safeParse(formOutput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.supplements).toEqual(validFormValues.supplements);
    }
  });

  it("coerces raw string payloads (API clients)", () => {
    const result = dailyEntryInputSchema.safeParse({
      ...validFormValues,
      timeInOffice: 8.5,
      calories: 2200,
      protein: 180,
    });
    expect(result.success).toBe(true);
  });

  it("treats missing supplements as an empty map", () => {
    const { supplements: _omitted, ...withoutSupplements } = validFormValues;
    const result = dailyEntryInputSchema.parse(withoutSupplements);
    expect(result.supplements).toEqual({});
  });
});

describe("presets", () => {
  it("defines stable ids and valid fields", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(PRESETS.length);
    for (const preset of PRESETS) {
      expect(Number(preset.apply.timeInOffice)).not.toBeNaN();
      expect(preset.apply.timeInOffice === "" || Number(preset.apply.timeInOffice) <= 24).toBe(true);
    }
  });

  it("rest day preset disables the gym session", () => {
    const rest = PRESETS.find((p) => p.id === "rest");
    expect(rest?.apply.gymSession).toBeNull();
    expect(rest?.apply.timeInOffice).toBe("0");
  });
});
