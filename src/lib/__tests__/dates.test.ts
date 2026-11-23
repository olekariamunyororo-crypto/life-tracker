import { describe, it, expect } from "vitest";
import { calendarDay, toDateKey } from "../dates";

describe("calendar-day helpers", () => {
  it("round-trips the stored UTC-midnight day regardless of timezone", () => {
    // How the server stores "2026-11-21": z.coerce.date() => UTC midnight.
    const stored = new Date("2026-11-21");
    expect(toDateKey(stored)).toBe("2026-11-21");
    expect(toDateKey(stored.toISOString())).toBe("2026-11-21");
  });

  it("calendarDay yields the same y/m/d in local time (no off-by-one west of UTC)", () => {
    const d = calendarDay(new Date("2026-11-21"));
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([2026, 11, 21]);
  });
});
