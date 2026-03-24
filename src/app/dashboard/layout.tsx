import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gridTemplateRows:"60px 1fr", minHeight:"100vh" }}>
      <Topbar user={session.user} />
      <Sidebar />
      <main style={{ padding:"32px", overflowY:"auto", background:"var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}
