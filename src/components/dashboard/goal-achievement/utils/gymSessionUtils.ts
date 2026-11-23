import type { DailyEntry } from '@/types/dashboard';
import type { WeeklyGymStats } from './types';
import { GOALS } from './goalConfig';
import { calendarDay } from '@/lib/dates';

// Monday 00:00 (local) of the week containing `date`.
function startOfIsoWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

const weekKeyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function getWeeklyGymSessions(entries: DailyEntry[]): WeeklyGymStats {
  const currentWeekKey = weekKeyOf(startOfIsoWeek(new Date()));

  // Count sessions in current week (entry dates are calendar days, see lib/dates)
  const currentWeekSessions = entries.filter(
    entry => entry.gymSession && weekKeyOf(startOfIsoWeek(calendarDay(entry.date))) === currentWeekKey
  ).length;

  // Calculate success rate (weeks with 3+ sessions)
  const weekMap = new Map<string, number>();
  
  entries.forEach(entry => {
    if (entry.gymSession) {
      const weekKey = weekKeyOf(startOfIsoWeek(calendarDay(entry.date)));
      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
    }
  });

  const successfulWeeks = Array.from(weekMap.values()).filter(sessions => sessions >= GOALS.weeklyGymSessions).length;
  const totalWeeks = weekMap.size;

  return {
    currentWeekSessions,
    weeklySuccessRate: totalWeeks > 0 ? (successfulWeeks / totalWeeks) * 100 : 0
  };
}
