"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  user: { name: string; streak: number; totalXP: number; level: number };
  stats: { studyHours: number; cardsReviewed: number; quizAccuracy: number; topicsCovered: number; dueCards: number };
  subjects: Array<{ subject: string; icon: string; progressPct: number; currentChapter?: string | null; color: string }>;
  schedule: Array<{ id: string; title: string; subject: string; time: string; status: string }>;
  flashcards: Array<{ id: string; subject: string; question: string; answer: string; reviewCount: number }>;
}

export function DashboardClient({ user, stats, subjects, schedule, flashcards }: Props) {
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: `Hi ${user.name.split(" ")[0]}! 👋 I'm your AI Study Buddy. Ask me to explain any concept, quiz you, or summarize notes!` },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState("Math");
  const [currentCard, setCurrentCard] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const [sessionModal, setSessionModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ subject: "Calculus", duration: "25", type: "ai_tutor" });
  const [scheduleForm, setScheduleForm] = useState({ title: "", subject: "Calculus", time: "09:00" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToast({ msg, id });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, subject: activeSubject }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.message?.content ?? "I couldn't respond right now." }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setChatLoading(false);
  }

  async function reviewCard(quality: number) {
    const card = flashcards[currentCard];
    if (!card) return;
    try {
      await fetch(`/api/flashcards/${card.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality }),
      });
      showToast(quality >= 3 ? "✅ Correct! +10 XP" : "📖 Added to review queue");
    } catch { /* ignore */ }
    setCardFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  }

  async function startSession() {
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sessionForm, duration: parseInt(sessionForm.duration) }),
      });
      showToast("🚀 Session started! Good luck!");
    } catch { /* ignore */ }
    setSessionModal(false);
  }

  async function addSchedule() {
    try {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });
      showToast("📅 Session added to schedule!");
    } catch { /* ignore */ }
    setScheduleModal(false);
  }

  const card = flashcards[currentCard];
  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"28px" }}>

      {/* Hero */}
      <div style={s.hero}>
        <div>
          <div style={s.heroGreeting}>👋 Good day, {firstName}</div>
          <div style={s.heroTitle}>Ready to learn something<br/>incredible today?</div>
          <div style={s.heroSub}>
            Level {user.level} · {user.totalXP} XP · {user.streak}-day streak 🔥
            {stats.dueCards > 0 && <span style={s.dueBadge}>{stats.dueCards} cards due</span>}
          </div>
        </div>
        <button style={s.heroCta} onClick={() => setSessionModal(true)}>▶ Start Session</button>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { icon:"🕐", val:`${stats.studyHours}h`, label:"Hours Studied", delta:"↑ This week", up:true },
          { icon:"🃏", val:stats.cardsReviewed, label:"Cards Reviewed", delta:`${stats.dueCards} due`, up:stats.dueCards===0 },
          { icon:"✅", val:`${stats.quizAccuracy}%`, label:"Quiz Accuracy", delta:"Keep it up!", up:true },
          { icon:"📚", val:stats.topicsCovered, label:"Topics Covered", delta:"Active subjects", up:true },
        ].map((st) => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statIcon}>{st.icon}</div>
            <div style={s.statVal}>{st.val}</div>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statDelta, background: st.up ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: st.up ? "var(--accent3)" : "var(--red)" }}>{st.delta}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={s.contentGrid}>

        {/* AI Chat */}
        <div style={s.chatPanel}>
          <div style={s.panelHeader}>
            <div style={s.aiDot} />
            <div>
              <div style={s.panelTitle}>AI Tutor</div>
              <div style={s.panelSub}>Ask anything • Powered by Rawlo</div>
            </div>
          </div>
          {/* Subject chips */}
          <div style={{ display:"flex", gap:"8px", padding:"12px 20px 0", flexWrap:"wrap" as const }}>
            {["Math","Physics","History","Biology","Code"].map((sub) => (
              <button key={sub} style={{ ...s.chip, ...(activeSubject===sub ? s.chipActive : {}) }} onClick={() => setActiveSubject(sub)}>{sub}</button>
            ))}
          </div>
          <div style={s.chatMessages}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ ...s.msg, flexDirection: m.role==="user" ? "row-reverse" : "row" }}>
                <div style={{ ...s.msgAvatar, background: m.role==="user" ? "linear-gradient(135deg,var(--accent2),var(--accent3))" : "linear-gradient(135deg,var(--accent),var(--accent2))" }}>
                  {m.role==="user" ? "👤" : "🤖"}
                </div>
                <div style={{ ...s.bubble, ...(m.role==="user" ? s.bubbleUser : {}) }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ ...s.msg, flexDirection:"row" }}>
                <div style={{ ...s.msgAvatar, background:"linear-gradient(135deg,var(--accent),var(--accent2))" }}>🤖</div>
                <div style={s.bubble}>
                  <span style={s.dot1}>●</span> <span style={s.dot2}>●</span> <span style={s.dot3}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={s.chatInputWrap}>
            <textarea
              style={s.chatInput}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Ask a question, say 'quiz me', or 'explain…'"
              rows={1}
            />
            <button style={s.sendBtn} onClick={sendChat} disabled={chatLoading}>➤</button>
          </div>
        </div>

        {/* Right column */}
        <div style={s.rightCol}>

          {/* Subject Progress */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div><div style={s.panelTitle}>Subject Progress</div><div style={s.panelSub}>This semester</div></div>
            </div>
            {subjects.map((sub) => (
              <div key={sub.subject} style={s.subjectRow}>
                <div style={s.subjectIcon}>{sub.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={s.subjectName}>{sub.subject}</div>
                  <div style={s.subjectTrack}>{sub.currentChapter ?? "Getting started"}</div>
                  <div style={s.miniBar}>
                    <div style={{ ...s.miniFill, width:`${sub.progressPct}%`, background:`linear-gradient(90deg,${sub.color},${sub.color}88)` }} />
                  </div>
                </div>
                <div style={{ ...s.pct, color:sub.color }}>{sub.progressPct}%</div>
              </div>
            ))}
          </div>

          {/* Flashcard */}
          {card && (
            <div style={s.panel}>
              <div style={{ ...s.panelHeader, paddingBottom:"0" }}>
                <div><div style={s.panelTitle}>Flashcard Review</div><div style={s.panelSub}>Spaced repetition</div></div>
                <button style={s.toolBtn} onClick={() => { setCurrentCard(Math.floor(Math.random()*flashcards.length)); setCardFlipped(false); showToast("🔀 Shuffled!"); }}>Shuffle</button>
              </div>
              <div style={{ padding:"16px 20px" }}>
                <div style={{ ...s.flashcard, ...(cardFlipped ? s.flashcardFlipped : {}) }} onClick={() => !cardFlipped && setCardFlipped(true)}>
                  <div style={s.cardLabel}>{cardFlipped ? "ANSWER" : "QUESTION"}</div>
                  <div>{cardFlipped ? card.answer : card.question}</div>
                </div>
                {!cardFlipped ? (
                  <button style={{ ...s.cardBtn, ...s.cardBtnFlip, marginTop:"10px", width:"100%" }} onClick={() => setCardFlipped(true)}>👁 Reveal Answer</button>
                ) : (
                  <div style={{ display:"flex", gap:"8px", marginTop:"10px" }}>
                    <button style={{ ...s.cardBtn, ...s.cardBtnWrong, flex:1 }} onClick={() => reviewCard(1)}>✕ Missed</button>
                    <button style={{ ...s.cardBtn, ...s.cardBtnRight, flex:1 }} onClick={() => reviewCard(5)}>✓ Got it!</button>
                  </div>
                )}
                <div style={s.cardCounter}>{currentCard+1} / {flashcards.length} cards</div>
              </div>
            </div>
          )}

          {/* Schedule */}
          <div style={s.panel}>
            <div style={{ ...s.panelHeader }}>
              <div><div style={s.panelTitle}>Today&apos;s Schedule</div><div style={s.panelSub}>{schedule.length} sessions</div></div>
              <button style={s.toolBtn} onClick={() => setScheduleModal(true)}>+ Add</button>
            </div>
            {schedule.length === 0 && <div style={{ padding:"20px", color:"var(--muted2)", fontSize:"13px", textAlign:"center" }}>No sessions yet. Add one!</div>}
            {schedule.map((item) => (
              <div key={item.id} style={s.scheduleRow}>
                <div style={s.timeLabel}>{item.time}</div>
                <div style={{ ...s.eventDot, background: item.status==="done" ? "var(--accent3)" : item.status==="active" ? "var(--accent)" : "var(--warn)" }} />
                <div style={{ flex:1 }}>
                  <div style={s.eventName}>{item.title}</div>
                  <div style={s.eventSub}>{item.subject}</div>
                </div>
                <div style={{ ...s.eventChip, ...(item.status==="done" ? s.chipDone : item.status==="active" ? s.chipActive2 : s.chipSoon) }}>
                  {item.status==="done" ? "Done" : item.status==="active" ? "Now" : "Soon"}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Session Modal */}
      {sessionModal && (
        <div style={s.overlay} onClick={() => setSessionModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>▶ Start Study Session</div>
              <button style={s.modalClose} onClick={() => setSessionModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              {(["subject","duration","type"] as const).map((field) => (
                <div key={field} style={{ marginBottom:"14px" }}>
                  <label style={s.formLabel}>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
                  {field==="subject" ? (
                    <select style={s.formInput} value={sessionForm.subject} onChange={e=>setSessionForm({...sessionForm,subject:e.target.value})}>
                      {["Calculus","Physics","Biology","History"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  ) : field==="duration" ? (
                    <select style={s.formInput} value={sessionForm.duration} onChange={e=>setSessionForm({...sessionForm,duration:e.target.value})}>
                      <option value="25">25 min (Pomodoro)</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  ) : (
                    <select style={s.formInput} value={sessionForm.type} onChange={e=>setSessionForm({...sessionForm,type:e.target.value})}>
                      <option value="ai_tutor">🤖 AI-Guided</option>
                      <option value="flashcard">🃏 Flashcards</option>
                      <option value="quiz">📝 Quiz</option>
                      <option value="notes">📒 Notes</option>
                    </select>
                  )}
                </div>
              ))}
              <button style={s.modalBtn} onClick={startSession}>Start Session 🚀</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={s.overlay} onClick={() => setScheduleModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>+ Add Session</div>
              <button style={s.modalClose} onClick={() => setScheduleModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={{ marginBottom:"14px" }}>
                <label style={s.formLabel}>Title</label>
                <input style={s.formInput} placeholder="e.g. Calculus Practice" value={scheduleForm.title} onChange={e=>setScheduleForm({...scheduleForm,title:e.target.value})}/>
              </div>
              <div style={{ marginBottom:"14px" }}>
                <label style={s.formLabel}>Subject</label>
                <select style={s.formInput} value={scheduleForm.subject} onChange={e=>setScheduleForm({...scheduleForm,subject:e.target.value})}>
                  {["Calculus","Physics","Biology","History"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:"14px" }}>
                <label style={s.formLabel}>Time</label>
                <input style={s.formInput} type="time" value={scheduleForm.time} onChange={e=>setScheduleForm({...scheduleForm,time:e.target.value})}/>
              </div>
              <button style={s.modalBtn} onClick={addSchedule}>Add to Schedule ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={s.toast}>{toast.msg}</div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  hero: { background:"linear-gradient(135deg,rgba(56,189,248,0.08),rgba(129,140,248,0.08))", border:"1px solid rgba(56,189,248,0.15)", borderRadius:"20px", padding:"28px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" },
  heroGreeting: { fontSize:"13px", color:"var(--accent)", fontWeight:500, marginBottom:"6px" },
  heroTitle: { fontFamily:"var(--font-head)", fontSize:"26px", fontWeight:700, marginBottom:"8px", lineHeight:1.3 },
  heroSub: { color:"var(--muted2)", fontSize:"14px", display:"flex", alignItems:"center", gap:"10px" },
  dueBadge: { background:"rgba(56,189,248,0.15)", color:"var(--accent)", fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"99px" },
  heroCta: { background:"var(--accent)", color:"#0b0f1a", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"14px", padding:"12px 24px", borderRadius:"99px", border:"none", cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(56,189,248,0.3)" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" },
  statCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", padding:"20px", cursor:"default" },
  statIcon: { fontSize:"22px", marginBottom:"12px" },
  statVal: { fontFamily:"var(--font-head)", fontSize:"28px", fontWeight:800, lineHeight:1 },
  statLabel: { fontSize:"12px", color:"var(--muted2)", marginTop:"4px" },
  statDelta: { fontSize:"11px", marginTop:"8px", padding:"3px 8px", borderRadius:"99px", display:"inline-block" },
  contentGrid: { display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", alignItems:"start" },
  chatPanel: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", display:"flex", flexDirection:"column", height:"540px", overflow:"hidden" },
  panelHeader: { padding:"18px 22px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"12px" },
  panelTitle: { fontFamily:"var(--font-head)", fontSize:"16px", fontWeight:700 },
  panelSub: { fontSize:"12px", color:"var(--muted2)", marginTop:"2px" },
  aiDot: { width:"8px", height:"8px", borderRadius:"50%", background:"var(--accent3)", flexShrink:0, animation:"blink 1.5s ease-in-out infinite" },
  chip: { padding:"6px 14px", borderRadius:"99px", fontSize:"12px", fontWeight:500, cursor:"pointer", border:"1px solid var(--border)", color:"var(--muted2)", background:"transparent", fontFamily:"var(--font-body)" },
  chipActive: { borderColor:"var(--accent)", color:"var(--accent)", background:"rgba(56,189,248,0.08)" },
  chatMessages: { flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:"14px" },
  msg: { display:"flex", gap:"10px", alignItems:"flex-start" },
  msgAvatar: { width:"30px", height:"30px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 },
  bubble: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"14px", padding:"11px 15px", fontSize:"13.5px", lineHeight:1.65, maxWidth:"80%", whiteSpace:"pre-wrap" as const },
  bubbleUser: { background:"rgba(56,189,248,0.1)", borderColor:"rgba(56,189,248,0.2)" },
  dot1: { animation:"dotBounce 1.2s ease-in-out infinite", color:"var(--muted)", display:"inline-block" },
  dot2: { animation:"dotBounce 1.2s ease-in-out .2s infinite", color:"var(--muted)", display:"inline-block" },
  dot3: { animation:"dotBounce 1.2s ease-in-out .4s infinite", color:"var(--muted)", display:"inline-block" },
  chatInputWrap: { padding:"14px 16px", borderTop:"1px solid var(--border)", display:"flex", gap:"10px" },
  chatInput: { flex:1, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:"13.5px", padding:"10px 14px", outline:"none", resize:"none", lineHeight:1.4 },
  sendBtn: { width:"42px", height:"42px", borderRadius:"8px", background:"var(--accent)", border:"none", color:"#0b0f1a", fontSize:"16px", cursor:"pointer", flexShrink:0 },
  rightCol: { display:"flex", flexDirection:"column", gap:"20px" },
  panel: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", overflow:"hidden" },
  subjectRow: { display:"flex", alignItems:"center", gap:"14px", padding:"14px 20px", borderBottom:"1px solid var(--border)" },
  subjectIcon: { fontSize:"20px", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface2)", borderRadius:"8px" },
  subjectName: { fontSize:"13.5px", fontWeight:600 },
  subjectTrack: { fontSize:"11px", color:"var(--muted2)", marginTop:"3px" },
  miniBar: { height:"4px", background:"var(--border)", borderRadius:"99px", marginTop:"6px", overflow:"hidden" },
  miniFill: { height:"100%", borderRadius:"99px", transition:"width .8s ease" },
  pct: { fontSize:"12px", fontWeight:700, flexShrink:0 },
  flashcard: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"20px", minHeight:"100px", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", cursor:"pointer", fontSize:"14.5px", fontWeight:500, lineHeight:1.6, position:"relative" },
  flashcardFlipped: { background:"rgba(129,140,248,0.1)", borderColor:"var(--accent2)" },
  cardLabel: { position:"absolute", top:"10px", left:"12px", fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--muted)", fontWeight:600 },
  cardBtn: { padding:"9px", borderRadius:"8px", border:"1px solid", fontFamily:"var(--font-body)", fontSize:"12.5px", fontWeight:600, cursor:"pointer" },
  cardBtnWrong: { borderColor:"rgba(248,113,113,0.3)", color:"var(--red)", background:"rgba(248,113,113,0.07)" },
  cardBtnRight: { borderColor:"rgba(52,211,153,0.3)", color:"var(--accent3)", background:"rgba(52,211,153,0.07)" },
  cardBtnFlip: { borderColor:"rgba(56,189,248,0.3)", color:"var(--accent)", background:"rgba(56,189,248,0.07)" },
  cardCounter: { fontSize:"11px", color:"var(--muted2)", textAlign:"center", marginTop:"10px" },
  scheduleRow: { display:"flex", alignItems:"center", gap:"14px", padding:"13px 20px", borderBottom:"1px solid var(--border)" },
  timeLabel: { fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--muted2)", minWidth:"40px" },
  eventDot: { width:"6px", height:"6px", borderRadius:"50%", flexShrink:0 },
  eventName: { fontSize:"13px", fontWeight:600 },
  eventSub: { fontSize:"11px", color:"var(--muted2)", marginTop:"2px" },
  eventChip: { fontSize:"10px", padding:"3px 9px", borderRadius:"99px", fontWeight:600 },
  chipDone: { background:"rgba(52,211,153,0.12)", color:"var(--accent3)" },
  chipActive2: { background:"rgba(56,189,248,0.12)", color:"var(--accent)" },
  chipSoon: { background:"rgba(100,116,139,0.15)", color:"var(--muted2)" },
  toolBtn: { padding:"7px 13px", borderRadius:"7px", border:"1px solid var(--border)", background:"transparent", color:"var(--muted2)", fontSize:"12px", fontWeight:500, cursor:"pointer", fontFamily:"var(--font-body)" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  modal: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", width:"100%", maxWidth:"460px", animation:"modalIn .25s ease" },
  modalHeader: { padding:"22px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" },
  modalTitle: { fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:700 },
  modalClose: { background:"none", border:"none", color:"var(--muted2)", fontSize:"18px", cursor:"pointer" },
  modalBody: { padding:"20px 24px 24px" },
  formLabel: { fontSize:"12px", fontWeight:600, color:"var(--muted2)", marginBottom:"6px", display:"block" },
  formInput: { width:"100%", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:"13.5px", padding:"11px 14px", outline:"none" },
  modalBtn: { width:"100%", padding:"13px", background:"var(--accent)", border:"none", borderRadius:"8px", color:"#0b0f1a", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"14.5px", cursor:"pointer", marginTop:"8px" },
  toast: { position:"fixed", bottom:"24px", right:"24px", zIndex:999, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"12px 18px", fontSize:"13px", boxShadow:"var(--shadow)", animation:"toastIn .3s ease" },
};
