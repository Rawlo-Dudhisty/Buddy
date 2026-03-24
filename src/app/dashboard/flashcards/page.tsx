import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlashcardsClient } from "@/components/FlashcardsClient";

export default async function FlashcardsPage() {
  const session = await auth();
  const uid = session!.user!.id!;
  const cards = await prisma.flashcard.findMany({
    where: { userId: uid },
    orderBy: { nextReview: "asc" },
  });
  return <FlashcardsClient initialCards={cards} />;
}
