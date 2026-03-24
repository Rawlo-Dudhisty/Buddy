import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, streak: 0, totalXP: 0, level: 1 },
    });

    // Seed default subjects for new user
    const defaultSubjects = [
      { subject: "Calculus", icon: "📐", color: "#38bdf8" },
      { subject: "Physics", icon: "⚛️", color: "#818cf8" },
      { subject: "Biology", icon: "🧬", color: "#34d399" },
      { subject: "History", icon: "📜", color: "#fb923c" },
    ];
    await prisma.subjectProgress.createMany({
      data: defaultSubjects.map((s) => ({ userId: user.id, ...s })),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    console.error("Registration error:", err);
  }
}
