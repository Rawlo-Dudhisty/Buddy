"use client";
import { useState } from "react";

interface Card {
  id: string; subject: string; question: string; answer: string;
  reviewCount: number; correctCount: number; difficulty: number;
  nextReview: Date | string;
}

interface Props { initialCards: Card[] }

const SUBJECTS = ["All","Calculus","Physics","Biology","History"];

export function FlashcardsClient({ initialCards }: Props) {
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState("All");
  const [mode, setMode] = useState<"browse"|"study">("browse");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ subject:"Calculus", question:"", answer:"" });
  const [toast, setToast] = useState("");

  const filtered = filter === "All" ? cards : cards.filter(c => c.subject === filter);
  const card = filtered[idx];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function review(quality: number) {
    if (!card) return;
    try {
      await fetch(`/api/flashcards/${card.id}/review`, {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ quality }),
      });
      showToast(quality >= 3 ? "✅ Correct! +10 XP" : "📖 Added to review queue");
    } catch { /* ignore */ }
    setFlipped(false);
    setIdx(prev => (prev + 1) % filtered.length);
  }

  async function addCard() {
    if (!addForm.question || !addForm.answer) return;
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify(addForm),
      });
      const newCard = await res.json();
      setCards(prev => [...prev, newCard]);
      setAddForm({ subject:"Calculus", question:"", answer:"" });
      setShowAdd(false);
      showToast("🃏 Card added!");
    } catch { showToast("Failed to add card"); }
  }

  const dueCount = cards.filter(c => new Date(c.nextReview) <= new Date()).length;
  const accuracy = cards.length > 0
    ? Math.round(cards.reduce((a,c) => a + c.correctCount, 0) / Math.max(cards.reduce((a,c) => a + c.reviewCount, 0), 1) * 100)
    : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={s.title}>Flashcards</h1>
          <p style={s.sub}>{cards.length} cards · {dueCount} due · {accuracy}% accuracy</p>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button style={s.modeBtn} onClick={() => { setMode(mode==="browse"?"study":"browse"); setIdx(0); setFlipped(false); }}>
            {mode==="browse" ? "▶ Study Mode" : "☰ Browse Mode"}
          </button>
          <button style={s.addBtn} onClick={() => setShowAdd(true)}>+ Add Card</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        {[
          { label:"Total Cards", val:cards.length, color:"var(--accent)" },
          { label:"Due Now", val:dueCount, color:"var(--warn)" },
          { label:"Accuracy", val:`${accuracy}%`, color:"var(--accent3)" },
          { label:"Mastered", val:cards.filter(c=>c.correctCount>=3).length, color:"var(--accent2)" },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statVal, color:st.color }}>{st.val}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {SUBJECTS.map(sub => (
          <button key={sub} style={{ ...s.chip, ...(filter===sub ? s.chipActive : {}) }}
            onClick={() => { setFilter(sub); setIdx(0); setFlipped(false); }}>
            {sub} {sub!=="All" && <span style={{ opacity:0.6 }}>({cards.filter(c=>c.subject===sub).length})</span>}
          </button>
        ))}
      </div>

      {mode === "study" && card ? (
        /* Study Mode */
        <div style={s.studyWrap}>
          <div style={s.progress}>
            <div style={{ ...s.progressFill, width:`${((idx+1)/filtered.length)*100}%` }} />
          </div>
          <div style={s.counter}>{idx+1} / {filtered.length}</div>
          <div style={{ ...s.studyCard, ...(flipped ? s.studyCardFlipped : {}) }} onClick={() => !flipped && setFlipped(true)}>
            <div style={s.cardBadge}>{flipped ? "ANSWER" : "QUESTION"}</div>
            <div style={s.subjectPill}>{card.subject}</div>
            <div style={s.cardContent}>{flipped ? card.answer : card.question}</div>
            {!flipped && <div style={s.tapHint}>Tap to reveal answer</div>}
          </div>
          {flipped ? (
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button style={{ ...s.reviewBtn, ...s.btnWrong }} onClick={() => review(1)}>✕ Missed it</button>
              <button style={{ ...s.reviewBtn, ...s.btnHard }} onClick={() => review(3)}>△ Hard</button>
              <button style={{ ...s.reviewBtn, ...s.btnGood }} onClick={() => review(4)}>◯ Good</button>
              <button style={{ ...s.reviewBtn, ...s.btnEasy }} onClick={() => review(5)}>★ Easy</button>
            </div>
          ) : (
            <button style={s.revealBtn} onClick={() => setFlipped(true)}>👁 Reveal Answer</button>
          )}
        </div>
      ) : (
        /* Browse Mode */
        <div style={s.grid}>
          {filtered.length === 0 && (
            <div style={s.empty}>No cards yet. Add your first card! 🃏</div>
          )}
          {filtered.map((c) => (
            <div key={c.id} style={s.cardItem}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <span style={{ ...s.subjectTag, background:`rgba(56,189,248,0.1)`, color:"var(--accent)", border:"1px solid rgba(56,189,248,0.2)" }}>{c.subject}</span>
                <span style={{ fontSize:"11px", color:"var(--muted2)" }}>×{c.reviewCount} reviewed</span>
              </div>
              <div style={s.qText}>Q: {c.question}</div>
              <div style={s.aText}>A: {c.answer}</div>
              <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
                <div style={{ ...s.diffPill, background: c.difficulty<=2?"rgba(52,211,153,0.1)":c.difficulty===3?"rgba(251,146,60,0.1)":"rgba(248,113,113,0.1)", color: c.difficulty<=2?"var(--accent3)":c.difficulty===3?"var(--warn)":"var(--red)" }}>
                  {c.difficulty<=2?"Easy":c.difficulty===3?"Medium":"Hard"}
                </div>
                <div style={s.accuracyPill}>
                  {c.reviewCount > 0 ? `${Math.round((c.correctCount/c.reviewCount)*100)}% correct` : "New"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      {showAdd && (
        <div style={s.overlay} onClick={() => setShowAdd(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>+ New Flashcard</span>
              <button style={s.closeBtn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <label style={s.label}>Subject</label>
              <select style={s.input} value={addForm.subject} onChange={e=>setAddForm({...addForm,subject:e.target.value})}>
                {["Calculus","Physics","Biology","History","Chemistry","Code"].map(s=><option key={s}>{s}</option>)}
              </select>
              <label style={{ ...s.label, marginTop:"14px" }}>Question</label>
              <textarea style={{ ...s.input, minHeight:"80px", resize:"vertical" }} value={addForm.question} onChange={e=>setAddForm({...addForm,question:e.target.value})} placeholder="Enter your question…"/>
              <label style={{ ...s.label, marginTop:"14px" }}>Answer</label>
              <textarea style={{ ...s.input, minHeight:"80px", resize:"vertical" }} value={addForm.answer} onChange={e=>setAddForm({...addForm,answer:e.target.value})} placeholder="Enter the answer…"/>
              <button style={s.submitBtn} onClick={addCard}>Save Card 🃏</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontFamily:"var(--font-head)", fontSize:"24px", fontWeight:800 },
  sub: { fontSize:"13px", color:"var(--muted2)", marginTop:"4px" },
  modeBtn: { padding:"9px 18px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", color:"var(--text)", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" },
  addBtn: { padding:"9px 18px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#0b0f1a", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" },
  statCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"16px 20px" },
  statVal: { fontFamily:"var(--font-head)", fontSize:"26px", fontWeight:800 },
  statLabel: { fontSize:"12px", color:"var(--muted2)", marginTop:"4px" },
  chip: { padding:"7px 16px", borderRadius:"99px", fontSize:"12px", fontWeight:500, cursor:"pointer", border:"1px solid var(--border)", color:"var(--muted2)", background:"transparent", fontFamily:"var(--font-body)" },
  chipActive: { borderColor:"var(--accent)", color:"var(--accent)", background:"rgba(56,189,248,0.08)" },
  // Study mode
  studyWrap: { display:"flex", flexDirection:"column", gap:"20px", alignItems:"center", padding:"20px 0" },
  progress: { width:"100%", maxWidth:"640px", height:"4px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" },
  progressFill: { height:"100%", background:"linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius:"99px", transition:"width .4s ease" },
  counter: { fontSize:"12px", color:"var(--muted2)" },
  studyCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", padding:"48px 40px", width:"100%", maxWidth:"640px", minHeight:"220px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", cursor:"pointer", position:"relative", transition:"all .25s" },
  studyCardFlipped: { background:"rgba(129,140,248,0.08)", borderColor:"var(--accent2)" },
  cardBadge: { position:"absolute", top:"16px", left:"20px", fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--muted)", fontWeight:600 },
  subjectPill: { position:"absolute", top:"14px", right:"16px", fontSize:"11px", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--muted2)", padding:"3px 10px", borderRadius:"99px" },
  cardContent: { fontSize:"18px", fontWeight:500, lineHeight:1.6, color:"var(--text)" },
  tapHint: { position:"absolute", bottom:"16px", fontSize:"11px", color:"var(--muted)", letterSpacing:"0.5px" },
  reviewBtn: { padding:"12px 22px", borderRadius:"10px", border:"1px solid", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .15s" },
  btnWrong: { borderColor:"rgba(248,113,113,0.35)", color:"var(--red)", background:"rgba(248,113,113,0.08)" },
  btnHard: { borderColor:"rgba(251,146,60,0.35)", color:"var(--warn)", background:"rgba(251,146,60,0.08)" },
  btnGood: { borderColor:"rgba(56,189,248,0.35)", color:"var(--accent)", background:"rgba(56,189,248,0.08)" },
  btnEasy: { borderColor:"rgba(52,211,153,0.35)", color:"var(--accent3)", background:"rgba(52,211,153,0.08)" },
  revealBtn: { padding:"12px 36px", borderRadius:"10px", border:"1px solid rgba(56,189,248,0.3)", color:"var(--accent)", background:"rgba(56,189,248,0.07)", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" },
  // Browse grid
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px" },
  empty: { gridColumn:"1/-1", textAlign:"center", color:"var(--muted2)", padding:"48px", fontSize:"15px" },
  cardItem: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", padding:"18px", transition:"border-color .18s" },
  subjectTag: { fontSize:"11px", fontWeight:600, padding:"3px 10px", borderRadius:"99px" },
  qText: { fontSize:"13.5px", fontWeight:600, lineHeight:1.5, color:"var(--text)", marginBottom:"8px" },
  aText: { fontSize:"13px", color:"var(--muted2)", lineHeight:1.5 },
  diffPill: { fontSize:"11px", padding:"3px 10px", borderRadius:"99px", fontWeight:600 },
  accuracyPill: { fontSize:"11px", padding:"3px 10px", borderRadius:"99px", background:"var(--surface2)", color:"var(--muted2)", fontWeight:500 },
  // Modal
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  modal: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", width:"100%", maxWidth:"480px", animation:"modalIn .25s ease" },
  modalHeader: { padding:"22px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" },
  modalTitle: { fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:700 },
  closeBtn: { background:"none", border:"none", color:"var(--muted2)", fontSize:"18px", cursor:"pointer" },
  modalBody: { padding:"20px 24px 24px", display:"flex", flexDirection:"column" },
  label: { fontSize:"12px", fontWeight:600, color:"var(--muted2)", marginBottom:"6px", display:"block" },
  input: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:"13.5px", padding:"10px 14px", outline:"none", width:"100%" },
  submitBtn: { marginTop:"20px", padding:"13px", background:"var(--accent)", border:"none", borderRadius:"8px", color:"#0b0f1a", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"14px", cursor:"pointer" },
  toast: { position:"fixed", bottom:"24px", right:"24px", zIndex:999, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"12px 18px", fontSize:"13px", boxShadow:"0 4px 32px rgba(0,0,0,0.4)", animation:"toastIn .3s ease" },
};
