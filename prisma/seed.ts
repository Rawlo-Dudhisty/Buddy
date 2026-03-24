import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Demo user
  const password = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@studyai.app" },
    update: {},
    create: {
      name: "Aarav Singh",
      email: "demo@studyai.app",
      password,
      streak: 12,
      totalXP: 680,
      level: 7,
    },
  });

  // Subject progress
  const subjects = [
    { subject: "Calculus", icon: "📐", progressPct: 62, currentChapter: "Chapter 5 of 8", color: "#38bdf8" },
    { subject: "Physics", icon: "⚛️", progressPct: 45, currentChapter: "Unit 3 — Waves", color: "#818cf8" },
    { subject: "Biology", icon: "🧬", progressPct: 78, currentChapter: "Cell Division", color: "#34d399" },
    { subject: "History", icon: "📜", progressPct: 30, currentChapter: "Post-WWI Era", color: "#fb923c" },
  ];
  for (const s of subjects) {
    await prisma.subjectProgress.upsert({
      where: { userId_subject: { userId: user.id, subject: s.subject } },
      update: s,
      create: { userId: user.id, ...s },
    });
  }

  // Flashcards
  const cards = [
    { subject: "Physics", question: "What is Newton's Second Law of Motion?", answer: "Force = Mass × Acceleration (F = ma)" },
    { subject: "Calculus", question: "What is the derivative of sin(x)?", answer: "cos(x)" },
    { subject: "Biology", question: "What is Mitosis?", answer: "Cell division producing two genetically identical daughter cells" },
    { subject: "History", question: "What caused World War I?", answer: "MAIN: Militarism, Alliances, Imperialism, Nationalism — plus assassination of Archduke Franz Ferdinand" },
    { subject: "Calculus", question: "What is the quadratic formula?", answer: "x = (−b ± √(b²−4ac)) / 2a" },
    { subject: "Physics", question: "State the Law of Conservation of Energy.", answer: "Energy cannot be created or destroyed, only transformed from one form to another." },
    { subject: "Biology", question: "What is photosynthesis?", answer: "Plants convert light + CO₂ + H₂O → glucose + O₂ using chlorophyll" },
    { subject: "Physics", question: "What is Ohm's Law?", answer: "V = IR — Voltage = Current × Resistance" },
  ];
  for (const c of cards) {
    await prisma.flashcard.create({ data: { userId: user.id, ...c } });
  }

  // Schedule
  const scheduleItems = [
    { title: "Calculus Practice", subject: "Calculus", time: "09:00", status: "done" },
    { title: "Physics Review", subject: "Physics", time: "14:00", status: "active" },
    { title: "History Reading", subject: "History", time: "17:00", status: "upcoming" },
  ];
  for (const item of scheduleItems) {
    await prisma.scheduleItem.create({ data: { userId: user.id, ...item } });
  }

  console.log("✅ Seed complete. Demo login: demo@studyai.app / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
