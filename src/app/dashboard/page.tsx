import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const uid = session!.user!.id!;

  const [user, subjects, schedule, flashcards] = await Promise.all([
    prisma.user.findUnique({ where: { id: uid } }),
    prisma.subjectProgress.findMany({ where: { userId: uid }, orderBy: { subject: "asc" } }),
    prisma.scheduleItem.findMany({ where: { userId: uid }, orderBy: { time: "asc" }, take: 5 }),
    prisma.flashcard.findMany({ where: { userId: uid }, orderBy: { nextReview: "asc" }, take: 20 }),
  ]);

  // Compute stats
  const sessions = await prisma.studySession.findMany({ where: { userId: uid } });
  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
  const totalReviews = flashcards.reduce((a, c) => a + c.reviewCount, 0);
  const totalCorrect = flashcards.reduce((a, c) => a + c.correctCount, 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  const uniqueSubjects = new Set(flashcards.map((c) => c.subject)).size;
  const dueCards = flashcards.filter((c) => c.nextReview <= new Date()).length;

  return (
    <DashboardClient
      user={{ name: user?.name ?? "Learner", streak: user?.streak ?? 0, totalXP: user?.totalXP ?? 0, level: user?.level ?? 1 }}
      stats={{ studyHours: +(totalMinutes / 60).toFixed(1), cardsReviewed: totalReviews, quizAccuracy: accuracy, topicsCovered: uniqueSubjects, dueCards }}
      subjects={subjects}
      schedule={schedule}
      flashcards={flashcards}
    />
  );
}
