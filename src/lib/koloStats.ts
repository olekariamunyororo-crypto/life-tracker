import type { TodaySnapshot } from "@/components/kolo/TodayView";

/** Map a daily entry-ish object into Kolo Today metrics. */
export function entryToTodaySnapshot(entry: {
  sleepHours?: number | null;
  sleepQuality?: number | null;
  energy?: number | null;
  mood?: number | null;
  calories?: number | null;
  protein?: number | null;
  gymSession?: { type?: string | null } | null;
  timeInOffice?: number | null;
  gripStrength?: number | null;
  bodyWeight?: number | null;
} | null): TodaySnapshot {
  if (!entry) {
    return {
      recovery: 62,
      strain: 4.2,
      strainTarget: 14,
      sleepHours: null,
      sleepQuality: null,
      energy: null,
      mood: null,
      gymType: null,
      calories: null,
      protein: null,
      name: "Alex",
    };
  }

  const sleepQ = entry.sleepQuality ?? 3;
  const energy = entry.energy ?? 3;
  const mood = entry.mood ?? 3;
  const recovery = Math.round(
    Math.min(100, Math.max(20, sleepQ * 12 + energy * 8 + mood * 6 + 10))
  );

  const gymBoost = entry.gymSession ? 8 : 0;
  const office = entry.timeInOffice ?? 0;
  const strain = Math.min(21, Math.round((gymBoost + office * 0.4) * 10) / 10);

  return {
    recovery,
    strain,
    strainTarget: 14,
    sleepHours: entry.sleepHours,
    sleepQuality: entry.sleepQuality,
    energy: entry.energy,
    mood: entry.mood,
    gymType: entry.gymSession?.type ?? null,
    calories: entry.calories,
    protein: entry.protein,
    name: "Alex",
  };
}
