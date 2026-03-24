import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "@/components/ScheduleClient";

export default async function SchedulePage() {
  const session = await auth();
  const uid = session!.user!.id!;
  const items = await prisma.scheduleItem.findMany({
    where: { userId: uid },
    orderBy: { time: "asc" },
  });
  return <ScheduleClient initialItems={items} />;
}
