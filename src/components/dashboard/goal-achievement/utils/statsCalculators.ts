import type { DailyEntry } from '@/types/dashboard';
import type { GoalStats, GoalStreaks } from './types';
import { GOALS } from './goalConfig';

export function calculateGoalStats(entries: DailyEntry[]): GoalStats {
  return entries.reduce(
    (acc, entry) => {
      if (entry.timeInOffice >= GOALS.timeInOffice) {
        acc.timeSuccess++;
      }
      if (entry.calories <= GOALS.calories) {
        acc.caloriesSuccess++;
      }
      if (entry.protein >= GOALS.protein) {
        acc.proteinSuccess++;
      }
      return acc;
    },
    { timeSuccess: 0, caloriesSuccess: 0, proteinSuccess: 0 }
  );
}

// Current streak = consecutive goal hits counting back from the MOST RECENT
// entry; the first miss ends that goal's streak. (The previous version walked
// newest -> oldest but reset the counter on every miss, so it reported the run
// at the *oldest* end of the window instead.) Works on a copy: Array#sort
// mutates and `entries` is a prop.
export function calculateCurrentStreaks(entries: DailyEntry[]): GoalStreaks {
  const newestFirst = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const streaks: GoalStreaks = { timeStreak: 0, caloriesStreak: 0, proteinStreak: 0 };
  const open = { time: true, calories: true, protein: true };

  for (const entry of newestFirst) {
    if (open.time) {
      if (entry.timeInOffice >= GOALS.timeInOffice) streaks.timeStreak++;
      else open.time = false;
    }
    if (open.calories) {
      if (entry.calories <= GOALS.calories) streaks.caloriesStreak++;
      else open.calories = false;
    }
    if (open.protein) {
      if (entry.protein >= GOALS.protein) streaks.proteinStreak++;
      else open.protein = false;
    }
    if (!open.time && !open.calories && !open.protein) break;
  }
  return streaks;
}
