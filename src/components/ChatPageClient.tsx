"use client";
import { useState, useRef, useEffect } from "react";

interface Msg { role: string; content: string }
interface Props { initialMessages: Msg[] }

const SUBJECTS = ["General","Math","Physics","Biology","History","Chemistry","Code","Literature"];
const QUICK = ["Explain this concept","Quiz me","Summarize my notes","Give me examples","Step-by-step solution","What's the formula for"];

export function ChatPageClient({ initialMessages }: Props) {
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages.length > 0 ? initialMessages : [{ role:"assistant", content:"Hi! I'm your AI Study Buddy 🎓 I can explain concepts, quiz you, summarise notes, and solve problems step by step. What would you like to learn today?" }]
  );
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  async function send(msg?: string) {
    const text = (msg ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role:"user", content:text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message:text, subject }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role:"assistant", content: data.message?.content ?? "Sorry, couldn't respond." }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  async function clearChat() {
    setMessages([{ role:"assistant", content:"Chat cleared! What would you like to study now? 📚" }]);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 92px)", gap:0 }}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>AI Tutor</h1>
          <p style={s.sub}>Powered by Claude · Your personal study companion</p>
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <select style={s.subjectSelect} value={subject} onChange={e=>setSubject(e.target.value)}>
            {SUBJECTS.map(s=><option key={s}>{s}</option>)}
          </select>
          <button style={s.clearBtn} onClick={clearChat}>Clear</button>
        </div>
      </div>

      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...s.row, justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
            {m.role==="assistant" && <div style={s.aiBubble2}>🤖</div>}
            <div style={{ ...s.bubble, ...(m.role==="user" ? s.userBubble : s.aiBubble) }}>
              {m.content.split("\n").map((line, j) => <span key={j}>{line}<br/></span>)}
            </div>
            {m.role==="user" && <div style={s.userAvatar}>👤</div>}
          </div>
        ))}
        {loading && (
          <div style={{ ...s.row, justifyContent:"flex-start" }}>
            <div style={s.aiBubble2}>🤖</div>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <span style={{ animation:"dotBounce 1.2s infinite", display:"inline-block" }}>●</span>{" "}
              <span style={{ animation:"dotBounce 1.2s .2s infinite", display:"inline-block" }}>●</span>{" "}
              <span style={{ animation:"dotBounce 1.2s .4s infinite", display:"inline-block" }}>●</span>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Quick prompts */}
      <div style={s.quickRow}>
        {QUICK.map(q=>(
          <button key={q} style={s.quickBtn} onClick={()=>send(q)}>{q}</button>
        ))}
      </div>

      <div style={s.inputArea}>
        <textarea
          style={s.textarea}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
          placeholder={`Ask anything about ${subject}… (Enter to send, Shift+Enter for newline)`}
          rows={2}
        />
        <button style={{ ...s.sendBtn, opacity:loading?0.6:1 }} onClick={()=>send()} disabled={loading}>
          {loading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px", flexWrap:"wrap", gap:"12px" },
  title: { fontFamily:"var(--font-head)", fontSize:"22px", fontWeight:700 },
  sub: { fontSize:"13px", color:"var(--muted2)", marginTop:"3px" },
  subjectSelect: { background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", fontFamily:"var(--font-body)", outline:"none" },
  clearBtn: { background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"var(--red)", borderRadius:"8px", padding:"8px 14px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" },
  messages: { flex:1, overflowY:"auto", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px 16px 0 0", padding:"20px", display:"flex", flexDirection:"column", gap:"16px" },
  row: { display:"flex", gap:"10px", alignItems:"flex-start" },
  aiBubble2: { width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,var(--accent),var(--accent2))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"15px" },
  userAvatar: { width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,var(--accent2),var(--accent3))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"15px" },
  bubble: { borderRadius:"14px", padding:"12px 16px", fontSize:"13.5px", lineHeight:1.7, maxWidth:"75%" },
  aiBubble: { background:"var(--surface2)", border:"1px solid var(--border)" },
  userBubble: { background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)" },
  quickRow: { display:"flex", gap:"8px", padding:"10px 0", overflowX:"auto", background:"var(--surface)", borderLeft:"1px solid var(--border)", borderRight:"1px solid var(--border)" },
  quickBtn: { flexShrink:0, padding:"6px 14px", borderRadius:"99px", border:"1px solid var(--border)", background:"transparent", color:"var(--muted2)", fontSize:"12px", cursor:"pointer", fontFamily:"var(--font-body)", whiteSpace:"nowrap" },
  inputArea: { display:"flex", gap:"10px", padding:"14px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"0 0 16px 16px", borderTop:"1px solid var(--border)" },
  textarea: { flex:1, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:"14px", padding:"10px 14px", outline:"none", resize:"none" },
  sendBtn: { width:"44px", minHeight:"44px", borderRadius:"8px", background:"var(--accent)", border:"none", color:"#0b0f1a", fontSize:"18px", cursor:"pointer", alignSelf:"flex-end" },
};
