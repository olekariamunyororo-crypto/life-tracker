// Entries are day-granular and stored as UTC midnight of the calendar day the
// user picked (the server parses "yyyy-MM-dd" with z.coerce.date()).
//
// Formatting that instant in the *viewer's* timezone shifts the day for anyone
// west of UTC (UTC-5 would show the previous day, and re-saving an edited entry
// would then move it back one day each time). These helpers always read the
// stored calendar day, independent of the viewer's timezone.

/** "yyyy-MM-dd" of the stored calendar day. */
export function toDateKey(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

/** A local-midnight Date for the stored calendar day — safe to pass to date-fns `format`. */
export function calendarDay(value: Date | string): Date {
  const [y, m, d] = toDateKey(value).split("-").map(Number);
  return new Date(y, m - 1, d);
}
