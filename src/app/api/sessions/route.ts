import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessionSchema = z.object({
  subject: z.string().min(1),
  duration: z.number().min(1),
  type: z.enum(["ai_tutor", "flashcard", "quiz", "notes"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.studySession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 20,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = sessionSchema.parse(body);
  const xpEarned = Math.floor(data.duration * 1.5);

  const [studySession] = await prisma.$transaction([
    prisma.studySession.create({
      data: {
        userId: session.user.id,
        ...data,
        xpEarned,
        endedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { totalXP: { increment: xpEarned }, streak: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ session: studySession, xpEarned }, { status: 201 });
}
