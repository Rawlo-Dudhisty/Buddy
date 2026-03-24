import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview, xpForQuality } from "@/lib/srs";
import { z } from "zod";

const reviewSchema = z.object({ quality: z.number().min(0).max(5) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { quality } = reviewSchema.parse(body);

  const card = await prisma.flashcard.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { interval, easeFactor, nextReview } = calculateNextReview(
    quality,
    card.reviewCount,
    card.easeFactor,
    card.interval
  );

  const correct = quality >= 3;
  const xp = xpForQuality(quality);

  const [updated] = await prisma.$transaction([
    prisma.flashcard.update({
      where: { id },
      data: {
        interval,
        easeFactor,
        nextReview,
        reviewCount: { increment: 1 },
        correctCount: correct ? { increment: 1 } : undefined,
        difficulty: Math.max(1, Math.min(5, card.difficulty + (correct ? -1 : 1))),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { totalXP: { increment: xp } },
    }),
  ]);

  // Update subject mastered count
  if (correct) {
    await prisma.subjectProgress.updateMany({
      where: { userId: session.user.id, subject: card.subject },
      data: { masteredCards: { increment: 1 } },
    });
  }

  return NextResponse.json({ card: updated, xpEarned: xp });
}
