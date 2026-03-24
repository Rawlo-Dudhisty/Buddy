import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subjects = await prisma.subjectProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { subject: "asc" },
  });

  // Recalculate progress percent from actual card data
  const updated = await Promise.all(
    subjects.map(async (s) => {
      const total = await prisma.flashcard.count({
        where: { userId: session.user.id, subject: s.subject },
      });
      const mastered = await prisma.flashcard.count({
        where: {
          userId: session.user.id,
          subject: s.subject,
          correctCount: { gte: 3 },
        },
      });
      const pct = total > 0 ? Math.round((mastered / total) * 100) : s.progressPct;
      return { ...s, progressPct: pct, totalCards: total, masteredCards: mastered };
    })
  );

  return NextResponse.json(updated);
}
