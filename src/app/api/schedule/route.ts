import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.scheduleItem.findMany({
    where: { userId: session.user.id },
    orderBy: { time: "asc" },
  });

  return NextResponse.json(items);
}

// ✅ Improved schema
const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // ✅ safe validation
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors },
      { status: 400 }
    );
  }

  const data = result.data;

  const item = await prisma.scheduleItem.create({
    data: { userId: session.user.id, ...data, status: "upcoming" },
  });

  return NextResponse.json(item, { status: 201 });
}

// ✅ PATCH validation
const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["upcoming", "completed"]),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = patchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors },
      { status: 400 }
    );
  }

  const { id, status } = result.data;

  const item = await prisma.scheduleItem.updateMany({
    where: { id, userId: session.user.id },
    data: { status },
  });

  return NextResponse.json(item);
}