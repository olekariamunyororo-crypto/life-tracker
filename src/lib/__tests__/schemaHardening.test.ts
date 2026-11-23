import { describe, expect, it } from "vitest";
import {
  MAX_SUPPLEMENTS_PER_ENTRY,
  dailyEntryFormSchema,
  dailyEntryInputSchema,
  entryIdSchema,
} from "../schemas/dailyEntry";

const base = { date: "2026-11-21", timeInOffice: 8, calories: 2000, protein: 150 };

describe("dailyEntryInputSchema hardening", () => {
  it("caps the number of supplements per entry", () => {
    const tooMany = Object.fromEntries(
      Array.from({ length: MAX_SUPPLEMENTS_PER_ENTRY + 1 }, (_, i) => [`s${i}`, true])
    );
    expect(dailyEntryInputSchema.safeParse({ ...base, supplements: tooMany }).success).toBe(false);
    const ok = Object.fromEntries(
      Array.from({ length: MAX_SUPPLEMENTS_PER_ENTRY }, (_, i) => [`s${i}`, true])
    );
    expect(dailyEntryInputSchema.safeParse({ ...base, supplements: ok }).success).toBe(true);
  });

  it("rejects empty or over-long supplement names", () => {
    expect(dailyEntryInputSchema.safeParse({ ...base, supplements: { ["x".repeat(41)]: true } }).success).toBe(false);
    expect(dailyEntryInputSchema.safeParse({ ...base, supplements: { "   ": true } }).success).toBe(false);
  });

  it("trims supplement names", () => {
    const r = dailyEntryInputSchema.parse({ ...base, supplements: { "  creatine ": true } });
    expect(Object.keys(r.supplements)).toEqual(["creatine"]);
  });

  it("rejects implausible dates", () => {
    expect(dailyEntryInputSchema.safeParse({ ...base, date: "1970-01-01" }).success).toBe(false);
    expect(dailyEntryInputSchema.safeParse({ ...base, date: "2999-01-01" }).success).toBe(false);
    expect(dailyEntryInputSchema.safeParse({ ...base, date: "not a date" }).success).toBe(false);
  });
});

describe("dailyEntryFormSchema date format", () => {
  const form = {
    date: "2026-11-21", timeInOffice: "8", calories: "2000", protein: "150",
    bodyWeight: "", gripStrength: "", sleepHours: "", sleepQuality: "", mood: "", energy: "",
    notes: "", activities: "", improvements: "", supplements: {}, gymSession: null,
  };
  it("requires YYYY-MM-DD", () => {
    expect(dailyEntryFormSchema.safeParse(form).success).toBe(true);
    expect(dailyEntryFormSchema.safeParse({ ...form, date: "11/21/2026" }).success).toBe(false);
  });
});

describe("entryIdSchema", () => {
  it("accepts cuid-like ids and rejects junk", () => {
    expect(entryIdSchema.safeParse("clx0abc123_DEF-9").success).toBe(true);
    for (const bad of ["", "a".repeat(65), "../etc/passwd", "id with space", "a'b", 42, null, {}]) {
      expect(entryIdSchema.safeParse(bad).success).toBe(false);
    }
  });
});
