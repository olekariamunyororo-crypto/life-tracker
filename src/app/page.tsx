import { TodayView } from "@/components/kolo/TodayView";
import { entryToTodaySnapshot } from "@/lib/koloStats";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getLatestEntry() {
  try {
    const entry = await prisma.dailyEntry.findFirst({
      where: { deletedAt: null },
      orderBy: { date: "desc" },
      include: { gymSession: true },
    });
    return entry;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const entry = await getLatestEntry();
  const snapshot = entryToTodaySnapshot(entry);

  return <TodayView data={snapshot} />;
}
