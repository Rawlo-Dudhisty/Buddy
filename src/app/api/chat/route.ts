import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, subject } = await req.json();

  if (!message?.trim())
    return NextResponse.json({ error: "Message required" }, { status: 400 });

  // ✅ Save user message
  await prisma.chatMessage.create({
    data: {
      userId: session.user.id,
      role: "user",
      content: message,
      subject: subject ?? null,
    },
  });

  // ✅ Fetch history
  const history = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Convert history to text format (Gemini uses plain text)
  const historyText = history
    .reverse()
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  // ✅ Check Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    return NextResponse.json(
      { error: "Server config error" },
      { status: 500 }
    );
  }

  // 🔥 CALL GEMINI API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are StudyAI, an expert tutor.

Rules:
- Explain step-by-step
- Be clear and concise
- Use examples
- Ask follow-up questions

Subject: ${subject ?? "General"}

Chat History:
${historyText}

User: ${message}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  // 🔥 Error handling
  if (!geminiRes.ok) {
    const text = await geminiRes.text();
    console.error("❌ Gemini Error:", text);

    return NextResponse.json(
      { error: "AI service failed" },
      { status: 500 }
    );
  }

  const data = await geminiRes.json();

  const aiText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate a response.";

  console.log("✅ AI Response:", aiText);

  // ✅ Save AI response
  const saved = await prisma.chatMessage.create({
    data: {
      userId: session.user.id,
      role: "assistant",
      content: aiText,
      subject: subject ?? null,
    },
  });

  return NextResponse.json({ message: saved });
}