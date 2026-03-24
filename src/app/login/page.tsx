"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoDot} />
          StudyAI
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to continue your learning journey</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={styles.divider}>
          <span>or try the demo</span>
        </div>
        <button
          style={styles.demoBtn}
          onClick={() => {
            setForm({ email: "demo@studyai.app", password: "demo1234" });
          }}
        >
          🎓 Fill Demo Credentials
        </button>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    animation: "fadeUp .4s ease",
  },
  logo: {
    fontFamily: "var(--font-head)",
    fontWeight: 800,
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "28px",
  },
  logoDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--accent)",
    boxShadow: "0 0 8px var(--accent)",
  },
  title: {
    fontFamily: "var(--font-head)",
    fontSize: "26px",
    fontWeight: 800,
    marginBottom: "6px",
  },
  sub: { color: "var(--muted2)", fontSize: "14px", marginBottom: "28px" },
  form: { display: "flex", flexDirection: "column", gap: "4px" },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--muted2)",
    marginBottom: "4px",
    marginTop: "12px",
  },
  input: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    fontSize: "14px",
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    fontFamily: "var(--font-body)",
  },
  error: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "var(--red)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginTop: "8px",
  },
  btn: {
    marginTop: "20px",
    background: "var(--accent)",
    color: "#0b0f1a",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    width: "100%",
  },
  divider: {
    textAlign: "center",
    color: "var(--muted)",
    fontSize: "12px",
    margin: "20px 0 12px",
    position: "relative",
  },
  demoBtn: {
    width: "100%",
    background: "rgba(56,189,248,0.08)",
    border: "1px solid rgba(56,189,248,0.25)",
    color: "var(--accent)",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  footer: { textAlign: "center", fontSize: "13px", color: "var(--muted2)", marginTop: "20px" },
  link: { color: "var(--accent)", textDecoration: "none", fontWeight: 600 },
};
