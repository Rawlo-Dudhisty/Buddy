import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubjectsPage() {
  const session = await auth();
  const uid = session!.user!.id!;

  const subjects = await prisma.subjectProgress.findMany({ where:{ userId:uid } });
  const cards = await prisma.flashcard.findMany({ where:{ userId:uid } });

  const enriched = subjects.map(s => {
    const sc = cards.filter(c => c.subject === s.subject);
    const mastered = sc.filter(c => c.correctCount >= 3).length;
    const pct = sc.length > 0 ? Math.round((mastered/sc.length)*100) : s.progressPct;
    return { ...s, totalCards:sc.length, masteredCards:mastered, progressPct:pct };
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div>
        <h1 style={{ fontFamily:"var(--font-head)", fontSize:"24px", fontWeight:800 }}>Subjects</h1>
        <p style={{ fontSize:"13px", color:"var(--muted2)", marginTop:"4px" }}>{subjects.length} active subjects</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
        {enriched.map(s => (
          <div key={s.id} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"18px", padding:"24px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:700 }}>{s.subject}</div>
                <div style={{ fontSize:"12px", color:"var(--muted2)", marginTop:"2px" }}>{s.currentChapter ?? "Getting started"}</div>
              </div>
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", color:"var(--muted2)", marginBottom:"8px" }}>
                <span>Progress</span><span style={{ color:s.color, fontWeight:700 }}>{s.progressPct}%</span>
              </div>
              <div style={{ height:"6px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${s.progressPct}%`, background:`linear-gradient(90deg,${s.color},${s.color}88)`, borderRadius:"99px", transition:"width .8s ease" }}/>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
              {[
                { label:"Total Cards", val:s.totalCards },
                { label:"Mastered", val:s.masteredCards },
                { label:"Accuracy", val:s.totalCards>0?`${Math.round((s.masteredCards/s.totalCards)*100)}%`:"—" },
              ].map(stat => (
                <div key={stat.label} style={{ background:"var(--surface2)", borderRadius:"10px", padding:"10px", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:800, color:s.color }}>{stat.val}</div>
                  <div style={{ fontSize:"10px", color:"var(--muted2)", marginTop:"2px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
