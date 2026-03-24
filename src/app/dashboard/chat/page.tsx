import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatPageClient } from "@/components/ChatPageClient";

export default async function ChatPage() {
  const session = await auth();
  const uid = session!.user!.id!;
  const history = await prisma.chatMessage.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "asc" },
    take: 40,
  });
  return <ChatPageClient initialMessages={history.map(m => ({ role: m.role, content: m.content }))} />;
}
