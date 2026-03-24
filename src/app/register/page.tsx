"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
    } else {
      router.push("/login?registered=1");
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"24px" },
    card: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", padding:"40px", width:"100%", maxWidth:"420px" },
    logo: { fontFamily:"var(--font-head)", fontWeight:800, fontSize:"22px", display:"flex", alignItems:"center", gap:"8px", marginBottom:"28px" },
    dot: { width:"8px", height:"8px", borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" },
    title: { fontFamily:"var(--font-head)", fontSize:"26px", fontWeight:800, marginBottom:"6px" },
    sub: { color:"var(--muted2)", fontSize:"14px", marginBottom:"28px" },
    label: { fontSize:"12px", fontWeight:600, color:"var(--muted2)", marginBottom:"4px", marginTop:"12px" },
    input: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontSize:"14px", padding:"12px 14px", outline:"none", width:"100%", fontFamily:"var(--font-body)" },
    error: { background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"var(--red)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginTop:"8px" },
    btn: { marginTop:"20px", background:"var(--accent)", color:"#0b0f1a", border:"none", borderRadius:"8px", padding:"14px", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"15px", cursor:"pointer", width:"100%" },
    footer: { textAlign:"center", fontSize:"13px", color:"var(--muted2)", marginTop:"20px" },
    link: { color:"var(--accent)", textDecoration:"none", fontWeight:600 },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.dot}/>StudyAI</div>
        <h1 style={s.title}>Create your account</h1>
        <p style={s.sub}>Start your personalized learning journey today</p>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" placeholder="Aarav Singh" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/>
          {error && <div style={s.error}>{error}</div>}
          <button style={{...s.btn, opacity:loading?0.7:1}} disabled={loading}>{loading?"Creating account…":"Create Account →"}</button>
        </form>
        <p style={s.footer}>Already have an account? <Link href="/login" style={s.link}>Sign in</Link></p>
      </div>
    </div>
  );
}
