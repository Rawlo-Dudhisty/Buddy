"use client";
import { useState } from "react";

interface Item { id:string; title:string; subject:string; time:string; status:string }
interface Props { initialItems: Item[] }

const SUBJECTS = ["Calculus","Physics","Biology","History","Chemistry","Code","Literature"];
const STATUS_COLORS: Record<string, { bg:string; color:string }> = {
  done:     { bg:"rgba(52,211,153,0.12)",  color:"var(--accent3)" },
  active:   { bg:"rgba(56,189,248,0.12)",  color:"var(--accent)" },
  upcoming: { bg:"rgba(100,116,139,0.12)", color:"var(--muted2)" },
};

export function ScheduleClient({ initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", subject:"Calculus", time:"09:00" });
  const [toast, setToast] = useState("");

  function showToast(msg:string) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  async function addItem() {
    if (!form.title) return;
    try {
      const res = await fetch("/api/schedule", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setItems(prev => [...prev, data].sort((a,b) => a.time.localeCompare(b.time)));
      setShowAdd(false);
      setForm({ title:"", subject:"Calculus", time:"09:00" });
      showToast("📅 Session added!");
    } catch { showToast("Failed to add session"); }
  }

  async function updateStatus(id:string, status:string) {
    try {
      await fetch("/api/schedule", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ id, status }),
      });
      setItems(prev => prev.map(i => i.id===id ? {...i,status} : i));
      showToast(status==="done" ? "✅ Marked as done!" : "🔄 Status updated");
    } catch { /* ignore */ }
  }

  const doneCount = items.filter(i=>i.status==="done").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={s.title}>Study Schedule</h1>
          <p style={s.sub}>{doneCount}/{items.length} sessions completed today</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowAdd(true)}>+ Add Session</button>
      </div>

      {/* Progress bar */}
      <div style={s.progressWrap}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
          <span style={s.progressLabel}>Today&apos;s Progress</span>
          <span style={s.progressPct}>{items.length>0?Math.round((doneCount/items.length)*100):0}%</span>
        </div>
        <div style={s.bar}>
          <div style={{ ...s.barFill, width:items.length>0?`${(doneCount/items.length)*100}%`:"0%" }} />
        </div>
      </div>

      {/* Timeline */}
      <div style={s.timeline}>
        {items.length === 0 && (
          <div style={s.empty}>No sessions scheduled yet. Add your first one! 📅</div>
        )}
        {items.map((item, i) => {
          const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.upcoming;
          return (
            <div key={item.id} style={s.timelineRow}>
              <div style={s.timeCol}>
                <div style={s.time}>{item.time}</div>
                {i < items.length - 1 && <div style={s.connector}/>}
              </div>
              <div style={{ ...s.card, ...(item.status==="active" ? s.cardActive : {}) }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={s.itemTitle}>{item.title}</div>
                    <div style={s.itemSub}>{item.subject}</div>
                  </div>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    <span style={{ ...s.chip2, background:sc.bg, color:sc.color }}>
                      {item.status.charAt(0).toUpperCase()+item.status.slice(1)}
                    </span>
                    {item.status !== "done" && (
                      <button style={s.doneBtn} onClick={() => updateStatus(item.id, "done")}>Mark done</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={s.overlay} onClick={()=>setShowAdd(false)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <div style={s.mHeader}>
              <span style={s.mTitle}>+ New Session</span>
              <button style={s.closeBtn} onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div style={s.mBody}>
              <label style={s.label}>Session Title</label>
              <input style={s.inp} placeholder="e.g. Calculus Review" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
              <label style={{ ...s.label, marginTop:"14px" }}>Subject</label>
              <select style={s.inp} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
                {SUBJECTS.map(s=><option key={s}>{s}</option>)}
              </select>
              <label style={{ ...s.label, marginTop:"14px" }}>Time</label>
              <input style={s.inp} type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/>
              <button style={s.submitBtn} onClick={addItem}>Add Session ✓</button>
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
  addBtn: { padding:"10px 20px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#0b0f1a", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"13px", cursor:"pointer" },
  progressWrap: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", padding:"20px 24px" },
  progressLabel: { fontSize:"13px", fontWeight:600 },
  progressPct: { fontSize:"13px", color:"var(--accent)", fontWeight:700 },
  bar: { height:"6px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" },
  barFill: { height:"100%", background:"linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius:"99px", transition:"width .6s ease" },
  timeline: { display:"flex", flexDirection:"column", gap:0 },
  empty: { textAlign:"center", color:"var(--muted2)", padding:"48px", fontSize:"15px" },
  timelineRow: { display:"flex", gap:"20px" },
  timeCol: { display:"flex", flexDirection:"column", alignItems:"center", width:"60px", flexShrink:0 },
  time: { fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--muted2)", paddingTop:"18px" },
  connector: { width:"2px", flex:1, background:"var(--border)", margin:"8px 0" },
  card: { flex:1, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", padding:"18px 20px", marginBottom:"12px" },
  cardActive: { borderColor:"rgba(56,189,248,0.35)", background:"rgba(56,189,248,0.04)" },
  itemTitle: { fontSize:"14.5px", fontWeight:700, marginBottom:"4px" },
  itemSub: { fontSize:"12.5px", color:"var(--muted2)" },
  chip2: { fontSize:"11px", fontWeight:600, padding:"4px 12px", borderRadius:"99px" },
  doneBtn: { fontSize:"11px", fontWeight:600, padding:"4px 12px", borderRadius:"99px", border:"1px solid rgba(52,211,153,0.3)", color:"var(--accent3)", background:"rgba(52,211,153,0.07)", cursor:"pointer", fontFamily:"var(--font-body)" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  modal: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", width:"100%", maxWidth:"440px" },
  mHeader: { padding:"22px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" },
  mTitle: { fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:700 },
  closeBtn: { background:"none", border:"none", color:"var(--muted2)", fontSize:"18px", cursor:"pointer" },
  mBody: { padding:"20px 24px 24px", display:"flex", flexDirection:"column" },
  label: { fontSize:"12px", fontWeight:600, color:"var(--muted2)", marginBottom:"6px", display:"block" },
  inp: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:"13.5px", padding:"10px 14px", outline:"none", width:"100%" },
  submitBtn: { marginTop:"20px", padding:"13px", background:"var(--accent)", border:"none", borderRadius:"8px", color:"#0b0f1a", fontFamily:"var(--font-head)", fontWeight:700, fontSize:"14px", cursor:"pointer" },
  toast: { position:"fixed", bottom:"24px", right:"24px", zIndex:999, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"12px 18px", fontSize:"13px", boxShadow:"0 4px 32px rgba(0,0,0,0.4)", animation:"toastIn .3s ease" },
};
