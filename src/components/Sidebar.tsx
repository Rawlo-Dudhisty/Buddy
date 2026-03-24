"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/chat", icon: "🤖", label: "AI Tutor", badge: "AI" },
  { href: "/dashboard/flashcards", icon: "🃏", label: "Flashcards" },
  { href: "/dashboard/schedule", icon: "📅", label: "Schedule" },
  { href: "/dashboard/subjects", icon: "📊", label: "Subjects" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={s.aside}>
      <div style={s.section}>MENU</div>
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={{ ...s.item, ...(active ? s.active : {}) }}>
            <span style={s.icon}>{item.icon}</span>
            {item.label}
            {item.badge && <span style={s.badge}>{item.badge}</span>}
          </Link>
        );
      })}

      <div style={{ ...s.section, marginTop: "16px" }}>ACCOUNT</div>
      <Link href="/dashboard/settings" style={{ ...s.item, ...(pathname === "/dashboard/settings" ? s.active : {}) }}>
        <span style={s.icon}>⚙️</span> Settings
      </Link>

      <div style={s.xpWrap}>
        <div style={s.xpLabel}>
          <span>⭐ Level Progress</span>
          <span style={{ color: "var(--accent)" }}>XP</span>
        </div>
        <div style={s.xpBar}>
          <div style={s.xpFill} />
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted2)", marginTop: "6px" }}>
          Keep studying to level up!
        </div>
      </div>
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  aside: { background:"var(--surface)", borderRight:"1px solid var(--border)", padding:"24px 16px", display:"flex", flexDirection:"column", gap:"4px", overflowY:"auto", position:"sticky", top:"60px", height:"calc(100vh - 60px)" },
  section: { fontSize:"10px", fontWeight:600, letterSpacing:"1.5px", color:"var(--muted)", textTransform:"uppercase", padding:"8px 10px 4px", marginTop:"4px" },
  item: { display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"8px", fontSize:"14px", fontWeight:500, color:"var(--muted2)", textDecoration:"none", border:"1px solid transparent", transition:"all .18s", position:"relative" as const },
  active: { background:"rgba(56,189,248,0.1)", borderColor:"rgba(56,189,248,0.2)", color:"var(--accent)" },
  icon: { fontSize:"16px", width:"20px", textAlign:"center" as const },
  badge: { marginLeft:"auto", background:"var(--accent2)", color:"#fff", fontSize:"9px", fontWeight:700, padding:"2px 7px", borderRadius:"99px" },
  xpWrap: { marginTop:"auto", padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" },
  xpLabel: { display:"flex", justifyContent:"space-between", fontSize:"12px", color:"var(--muted2)", marginBottom:"8px" },
  xpBar: { height:"5px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" },
  xpFill: { height:"100%", width:"68%", background:"linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius:"99px", animation:"xpPulse 2s ease-in-out infinite" },
};
