import { format } from 'date-fns';
import type { DailyEntry } from '@/types/dashboard';
import { calendarDay } from '@/lib/dates';

export interface EntryWithTimestamp extends DailyEntry {
  displayLabel: string;
}

export function sortEntriesByDate(entries: DailyEntry[]): DailyEntry[] {
  // Chronological by the day the entry is FOR; createdAt only breaks ties.
  // (Sorting/labelling by createdAt misplaced back-filled entries.)
  return [...entries].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function addDisplayLabels(entries: DailyEntry[]): EntryWithTimestamp[] {
  return entries.map((entry) => ({
    ...entry,
    displayLabel: format(calendarDay(entry.date), 'MMM d')
  }));
}

export function getLabels(entries: EntryWithTimestamp[]): string[] {
  return entries.map(entry => entry.displayLabel);
}
