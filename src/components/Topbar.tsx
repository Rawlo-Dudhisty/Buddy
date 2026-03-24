"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

interface TopbarProps {
  user: { name?: string | null; email?: string | null };
}

export function Topbar({ user }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <header style={s.bar}>
      <div style={s.left}>
        <Link href="/dashboard" style={s.logo}>
          <div style={s.dot} />
          StudyAI
        </Link>
      </div>
      <div style={s.right}>
        <div style={s.streak}>🔥 Daily streak</div>
        <div style={{ position: "relative" }}>
          <div style={s.avatar} onClick={() => setMenuOpen(!menuOpen)}>{initials}</div>
          {menuOpen && (
            <div style={s.dropdown}>
              <div style={s.dropName}>{user.name}</div>
              <div style={s.dropEmail}>{user.email}</div>
              <hr style={s.hr} />
              <button style={s.dropBtn} onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const s: Record<string, React.CSSProperties> = {
  bar: { gridColumn:"1/-1", background:"rgba(11,15,26,0.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", position:"sticky", top:0, zIndex:100 },
  left: { display:"flex", alignItems:"center", gap:"16px" },
  logo: { fontFamily:"var(--font-head)", fontWeight:800, fontSize:"20px", display:"flex", alignItems:"center", gap:"8px", color:"var(--text)", textDecoration:"none" },
  dot: { width:"8px", height:"8px", borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" },
  right: { display:"flex", alignItems:"center", gap:"16px" },
  streak: { background:"rgba(251,146,60,0.12)", border:"1px solid rgba(251,146,60,0.25)", color:"var(--warn)", fontSize:"13px", fontWeight:500, padding:"5px 12px", borderRadius:"99px" },
  avatar: { width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,var(--accent),var(--accent2))", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"13px", color:"#fff", cursor:"pointer" },
  dropdown: { position:"absolute", right:0, top:"44px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"12px", minWidth:"180px", boxShadow:"var(--shadow)", zIndex:200 },
  dropName: { fontWeight:700, fontSize:"14px", marginBottom:"2px" },
  dropEmail: { fontSize:"12px", color:"var(--muted2)", marginBottom:"8px" },
  hr: { border:"none", borderTop:"1px solid var(--border)", margin:"8px 0" },
  dropBtn: { background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"var(--red)", borderRadius:"6px", padding:"8px 12px", fontSize:"13px", fontWeight:600, cursor:"pointer", width:"100%", fontFamily:"var(--font-body)" },
};
