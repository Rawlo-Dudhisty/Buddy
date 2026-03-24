import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const due = searchParams.get("due") === "true";

  const where: Record<string, unknown> = { userId: session.user.id };
  if (subject) where.subject = subject;
  if (due) where.nextReview = { lte: new Date() };

  const cards = await prisma.flashcard.findMany({
    where,
    orderBy: { nextReview: "asc" },
  });
  return NextResponse.json(cards);
}

const createSchema = z.object({
  subject: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = createSchema.parse(body);

  const card = await prisma.flashcard.create({
    data: { userId: session.user.id, ...data },
  });

  // Update subject progress card count
  await prisma.subjectProgress.upsert({
    where: { userId_subject: { userId: session.user.id, subject: data.subject } },
    update: { totalCards: { increment: 1 } },
    create: { userId: session.user.id, subject: data.subject, totalCards: 1 },
  });

  return NextResponse.json(card, { status: 201 });
}
