import { AuthError, getSessionUserId } from "@/lib/auth";
import { getRecentEntries } from "@/lib/repositories/dailyEntry";
import type { DailyEntry } from "@/types/dashboard";

// Server-side data source for the dashboard (Server Component).
// The Prisma client comes from the singleton via the repository layer.
export async function getDashboardData(): Promise<DailyEntry[]> {
  const userId = await getSessionUserId(); // AuthError propagates: never render "empty" for a signed-out user
  try {
    const entries = await getRecentEntries(userId);
    return entries as unknown as DailyEntry[];
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error("Error fetching dashboard data:", error);
    return []; // DB unavailable: render the empty state instead of a crash
  }
}
