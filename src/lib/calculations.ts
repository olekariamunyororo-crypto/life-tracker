// Brzycki one-rep-max estimate: weight × 36 / (37 − reps).
//
// The formula is only defined for 1–36 reps (at 37 it divides by zero and
// beyond that it goes negative), and it is only a *reasonable* estimate for
// roughly ≤10 reps. The input schema allows up to 500 reps, so this must be
// total: invalid sets contribute 0 and long sets are clamped to 36 reps.
export function calculateOneRepMax(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps < 1) return 0;
  const effectiveReps = Math.min(reps, 36);
  return weight * (36 / (37 - effectiveReps));
}
