import { describe, it, expect } from "vitest";
import {
  calculateStrengthLevel,
  COMPOUND_LIFTS,
  strengthStandards,
  type CompoundLift,
} from "../StrengthStandards";

describe("strengthStandards table", () => {
  it("has ascending standards per lift", () => {
    for (const lift of COMPOUND_LIFTS) {
      const values = Object.values(strengthStandards[lift]);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    }
  });

  it("covers exactly the four compound lifts", () => {
    expect(COMPOUND_LIFTS).toHaveLength(4);
    expect(Object.keys(strengthStandards)).toHaveLength(4);
  });
});

describe("calculateStrengthLevel", () => {
  const lift: CompoundLift = "Flat Bench Press";

  it("classifies below Beginner ratio as Beginner", () => {
    // ratio 0.5 = exactly the Beginner standard for bench
    const result = calculateStrengthLevel(lift, 50, 100);
    expect(result.currentLevel).toBe("Beginner");
    expect(result.nextLevel).toBe("Novice");
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(1);
  });

  it("reaches Elite at the top ratio and reports no next level", () => {
    // Elite bench standard is 1.5 → 1RM of 150 at 100kg bodyweight
    const result = calculateStrengthLevel(lift, 150, 100);
    expect(result.currentLevel).toBe("Elite");
    expect(result.nextLevel).toBeNull();
    expect(result.progress).toBe(1);
  });

  it("clamps progress into [0, 1] for out-of-range inputs", () => {
    const below = calculateStrengthLevel(lift, 1, 100); // ratio 0.01
    expect(below.progress).toBeGreaterThanOrEqual(0);
    const above = calculateStrengthLevel(lift, 500, 10); // ratio 50
    expect(above.progress).toBeLessThanOrEqual(1);
  });

  it("is halfway to the next level at the midpoint ratio", () => {
    // Between Novice (0.75) and Intermediate (1.0): midpoint ratio 0.875
    const result = calculateStrengthLevel(lift, 87.5, 100);
    expect(result.currentLevel).toBe("Novice");
    expect(result.progress).toBeCloseTo(0.5, 5);
  });
});
