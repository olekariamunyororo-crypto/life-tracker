import { describe, it, expect } from "vitest";
import { calculateOneRepMax } from "../calculations";

describe("calculateOneRepMax (Brzycki formula)", () => {
  it("returns roughly the weight for a 1-rep set", () => {
    // 36 / (37 - 1) ≈ 1.0
    expect(calculateOneRepMax(100, 1)).toBeCloseTo(100, 1);
  });

  it("increases estimated max as reps decrease at the same load", () => {
    const heavyFew = calculateOneRepMax(140, 3);
    const lightMany = calculateOneRepMax(100, 12);
    expect(heavyFew).toBeGreaterThan(lightMany);
  });

  it("matches the hand-computed formula", () => {
    // 36 / (37 - 5) = 36/32 = 1.125 → 135 * 1.125 = 151.875
    expect(calculateOneRepMax(135, 5)).toBeCloseTo(151.875, 6);
  });

  it("grows monotonically with reps for fixed weight", () => {
    for (let reps = 1; reps < 12; reps++) {
      expect(calculateOneRepMax(100, reps + 1)).toBeGreaterThan(
        calculateOneRepMax(100, reps)
      );
    }
  });
});

describe("calculateOneRepMax edge cases", () => {
  it("never returns Infinity or a negative number (schema allows up to 500 reps)", () => {
    for (const reps of [0, 36, 37, 38, 100, 500]) {
      const v = calculateOneRepMax(100, reps);
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it("treats zero-rep / invalid sets as contributing nothing", () => {
    expect(calculateOneRepMax(100, 0)).toBe(0);
    expect(calculateOneRepMax(0, 5)).toBe(0);
    expect(calculateOneRepMax(NaN, 5)).toBe(0);
  });

  it("clamps very long sets to the formula's valid range", () => {
    expect(calculateOneRepMax(10, 500)).toBe(calculateOneRepMax(10, 36));
  });
});

