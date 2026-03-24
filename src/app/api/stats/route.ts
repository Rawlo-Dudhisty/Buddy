import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.id;

  const [user, sessions, cards, dueCards] = await Promise.all([
    prisma.user.findUnique({ where: { id: uid } }),
    prisma.studySession.findMany({ where: { userId: uid } }),
    prisma.flashcard.findMany({ where: { userId: uid } }),
    prisma.flashcard.count({
      where: { userId: uid, nextReview: { lte: new Date() } },
    }),
  ]);

  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
  const totalCards = cards.reduce((a, c) => a + c.reviewCount, 0);
  const correctCards = cards.reduce((a, c) => a + c.correctCount, 0);
  const accuracy = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;
  const uniqueSubjects = new Set(cards.map((c) => c.subject)).size;

  return NextResponse.json({
    streak: user?.streak ?? 0,
    totalXP: user?.totalXP ?? 0,
    level: user?.level ?? 1,
    studyHours: +(totalMinutes / 60).toFixed(1),
    cardsReviewed: totalCards,
    quizAccuracy: accuracy,
    topicsCovered: uniqueSubjects,
    dueCards,
  });
}
