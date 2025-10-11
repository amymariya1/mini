import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Simple color scale from low (green) to high (red) for assessment totals
function scoreToColor(total) {
  if (total === null || total === undefined) return "#e5e7eb"; // gray for no data
  if (total <= 20) return "#4ade80";      // green
  if (total <= 40) return "#a3e635";      // lime
  if (total <= 60) return "#facc15";      // yellow
  if (total <= 80) return "#f59e0b";      // amber
  if (total <= 100) return "#ef4444";     // red
  return "#b91c1c";                        // dark red
}

// Mood color from 0..10
function moodColor(val) {
  const v = Number(val);
  if (Number.isNaN(v)) return "#e5e7eb";
  if (v <= 2) return "#22c55e"; // very calm/positive
  if (v <= 4) return "#84cc16";
  if (v <= 6) return "#f59e0b";
  if (v <= 8) return "#f97316";
  return "#ef4444";
}

function buildMonthMatrix(year, month /* 0-based */) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const totalDays = lastOfMonth.getDate();

  const cells = [];
  // Leading blanks
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  // Month days
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Trailing blanks to complete grid (42 cells = 6 weeks)
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Compute Sunday-start week for a given date
function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0=Sun
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    days.push({
      labelShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][cur.getDay()],
      dayNumber: cur.getDate(),
      key: `${yyyy}-${mm}-${dd}`,
      date: cur,
    });
  }
  return days;
}

function formatWeekRange(days) {
  if (!days || days.length !== 7) return "";
  const first = days[0].date;
  const last = days[6].date;
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  const monthShort = new Intl.DateTimeFormat(undefined, { month: "short" }).format(first);
  const monthShortLast = new Intl.DateTimeFormat(undefined, { month: "short" }).format(last);
  const year = first.getFullYear();
  if (sameMonth) {
    return `${monthShort} ${first.getDate()}–${last.getDate()}, ${year}`;
  }
  return `${monthShort} ${first.getDate()} – ${monthShortLast} ${last.getDate()}, ${year}`;
}

// Reusable calendar for embedding on pages like Home (monthly overview + heat colors)
export function MoodCalendar() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [history, setHistory] = useState([]); // [{date:'YYYY-MM-DD', D, A, S}]
  const [journal, setJournal] = useState({}); // { 'YYYY-MM-DD': { note, mood, moodTag } }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch (_) {}
    try {
      const jr = localStorage.getItem("mm_journal");
      if (jr) setJournal(JSON.parse(jr));
    } catch (_) {}
  }, []);

  // Refresh journal when window regains focus or visibility changes (e.g., after navigating back)
  useEffect(() => {
    function refreshJournal() {
      try {
        const jr = localStorage.getItem("mm_journal");
        setJournal(jr ? JSON.parse(jr) : {});
      } catch (_) {}
    }
    window.addEventListener("focus", refreshJournal);
    document.addEventListener("visibilitychange", refreshJournal);
    return () => {
      window.removeEventListener("focus", refreshJournal);
      document.removeEventListener("visibilitychange", refreshJournal);
    };
  }, []);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const it of history || []) {
      const total = Number(it.D || 0) + Number(it.A || 0) + Number(it.S || 0);
      map.set(it.date, { ...it, total });
    }
    return map;
  }, [history]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  const cells = buildMonthMatrix(year, month);

  function dayKey(day) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function today() {
    setViewDate(new Date());
  }

  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Monthly Overview</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="cta-btn" onClick={prevMonth} style={{ color: "black" }}>◀ Prev</button>
          <button className="cta-btn" onClick={today} style={{ color: "black" }}>Today</button>
          <button className="cta-btn" onClick={nextMonth} style={{ color: "black" }}>Next ▶</button>
        </div>
      </header>

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>{monthName}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center" }}>
            <span>Legend:</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, background: "#4ade80", borderRadius: 3, display: "inline-block" }} />Low</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, background: "#facc15", borderRadius: 3, display: "inline-block" }} />Medium</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, background: "#ef4444", borderRadius: 3, display: "inline-block" }} />High</span>
          </div>
        </div>
      </div>

      {/* Weekday header */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ padding: 10, textAlign: "center", fontWeight: 700, color: "#374151" }}>{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} style={{ height: 90, borderRight: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }} />;
            const key = dayKey(day);
            const rec = byDate.get(key);
            const color = scoreToColor(rec?.total);
            // Mood tag color for box background (not the date number)
            const tagColors = {
              Happy:   "#22c55e",
              Sad:     "#60a5fa",
              Angry:   "#ef4444",
              Calm:    "#14b8a6",
              Excited: "#f59e0b",
              Tired:   "#9ca3af",
              Stressed:"#f97316",
              Grateful:"#e879f9",
            };
            const moodTag = journal?.[key]?.moodTag;
            const boxBg = moodTag ? tagColors[moodTag] : color;
            const dateColor = "#6b7280";
            return (
              <button
                key={idx}
                onClick={() => navigate(`/journal/${key}`)}
                style={{
                  height: 90,
                  borderRight: "1px solid #f3f4f6",
                  borderBottom: "1px solid #f3f4f6",
                  padding: 8,
                  position: "relative",
                  textAlign: "left",
                  background: "white"
                }}
              >
                <div style={{ position: "absolute", top: 6, right: 8, fontSize: 12, color: dateColor }}>{day}</div>
                <div style={{ marginTop: 18, height: 48, borderRadius: 8, background: boxBg, boxShadow: rec ? "inset 0 0 0 2px rgba(0,0,0,0.05)" : "none" }} />
                {rec && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#374151" }}>D{rec.D}|A{rec.A}|S{rec.S}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="subtle" style={{ marginTop: 12, fontSize: 12 }}>
        Tip: Tap a date to add a note and track mood for that day. Calendar colors reflect your saved assessment results.
      </p>
    </motion.div>
  );
}

// Weekly Planner styled to match the purple gradient minimalist template
function WeeklyPlanner() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [journal, setJournal] = useState({}); // { 'YYYY-MM-DD': {note, mood} }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_journal");
      if (raw) setJournal(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const days = useMemo(() => getWeekDates(viewDate), [viewDate]);
  const weekRange = useMemo(() => formatWeekRange(days), [days]);

  function prevWeek() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  }
  function nextWeek() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  }
  function today() {
    setViewDate(new Date());
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Gradient header bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #a18cd1 0%, #9b5de5 45%, #fbc2eb 100%)",
          color: "white",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 18px 40px rgba(155, 93, 229, 0.25)",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.3 }}>Weekly Planner</div>
            <div style={{ opacity: 0.95, fontSize: 14 }}>{weekRange}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="cta-btn"
              onClick={prevWeek}
              style={{
                background: "#ffffff",
                color: "#4b5563",
                borderRadius: 999,
                padding: "8px 14px",
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              ◀ Prev
            </button>
            <button
              className="cta-btn"
              onClick={today}
              style={{
                background: "#ffffff",
                color: "#4b5563",
                borderRadius: 999,
                padding: "8px 14px",
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              Today
            </button>
            <button
              className="cta-btn"
              onClick={nextWeek}
              style={{
                background: "#ffffff",
                color: "#4b5563",
                borderRadius: 999,
                padding: "8px 14px",
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Day columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
        {days.map((d) => {
          const j = journal[d.key] || {};
          const hasNote = !!(j.note && j.note.trim());
          const moodC = moodColor(j.mood);
          // Map moodTag to a color scheme for the date circle
          const tagColors = {
            Happy:   { bg: "#22c55e", color: "white" },   // green
            Sad:     { bg: "#60a5fa", color: "white" },   // blue
            Angry:   { bg: "#ef4444", color: "white" },   // red
            Calm:    { bg: "#14b8a6", color: "white" },   // teal
            Excited: { bg: "#f59e0b", color: "black" },   // amber (better with dark text)
            Tired:   { bg: "#9ca3af", color: "white" },   // gray
            Stressed:{ bg: "#f97316", color: "black" },   // orange
            Grateful:{ bg: "#e879f9", color: "white" },   // pink
          };
          const tag = j.moodTag ? tagColors[j.moodTag] : null;
          const circleBg = tag ? tag.bg : "linear-gradient(135deg, #c084fc, #a78bfa)";
          const circleColor = tag ? tag.color : "white";
          return (
            <button
              key={d.key}
              onClick={() => navigate(`/journal/${d.key}`)}
              style={{
                textAlign: "left",
                background: "#ffffff",
                borderRadius: 20,
                padding: 14,
                border: "1px solid #eee7fb",
                boxShadow: "0 10px 24px rgba(155,93,229,0.10)",
                minHeight: 190,
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 28px rgba(155,93,229,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(155,93,229,0.10)";
              }}
            >
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, color: "#6b7280", letterSpacing: 0.2 }}>{d.labelShort}</div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: circleBg,
                    color: circleColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    boxShadow: "0 6px 14px rgba(192,132,252,0.45)",
                    fontSize: 14,
                  }}
                >
                  {d.dayNumber}
                </div>
              </div>

              {/* Mood pill + mood tag if present */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 999, background: "#f6f3ff", border: "1px solid #ede9fe" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: moodC, display: "inline-block", boxShadow: "0 0 0 2px #fff" }} />
                  <span style={{ fontSize: 12, color: "#4b5563" }}>Mood {typeof j.mood === "number" ? j.mood : "—"}/10</span>
                </div>
                {j.moodTag ? (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eef2ff", border: "1px solid #e0e7ff", fontSize: 12, color: "#4338ca" }}>
                    {j.moodTag}
                  </span>
                ) : null}
              </div>

              {/* Note area */}
              <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563", minHeight: 78, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {hasNote ? (
                  <>
                    {j.note.slice(0, 160)}
                    {j.note.length > 160 ? "…" : null}
                  </>
                ) : (
                  <span style={{ color: "#9ca3af" }}>Tap to add a note…</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Full-page Calendar route, focused on Weekly Planner only
export default function Calendar() {
  const [mode, setMode] = useState('weekly'); // 'monthly' | 'weekly' | 'daily'
  return (
    <div className="landing-container">
      <Navbar />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 18px" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
            <h2 style={{ margin:0 }}>Calendar</h2>
            <div style={{ display:'flex', gap:8 }}>
              <button className={`cta-btn ${mode === 'monthly' ? '' : 'secondary'}`} onClick={() => setMode('monthly')} style={{ color:'black' }}>Monthly</button>
              <button className={`cta-btn ${mode === 'weekly' ? '' : 'secondary'}`} onClick={() => setMode('weekly')} style={{ color:'black' }}>Weekly</button>
              <button className={`cta-btn ${mode === 'daily' ? '' : 'secondary'}`} onClick={() => setMode('daily')} style={{ color:'black' }}>Daily</button>
            </div>
          </header>

          {mode === 'monthly' && <MoodCalendar />}
          {mode === 'weekly' && <WeeklyPlanner />}
          {mode === 'daily' && <DailyView />}
        </motion.div>
      </main>
    </div>
  );
}

// Daily view for a single date: shows journal and assessment result
function DailyView() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [journal, setJournal] = useState({}); // { 'YYYY-MM-DD': { note, mood, moodTag } }
  const [history, setHistory] = useState([]); // [{date:'YYYY-MM-DD', D, A, S}]

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mm_journal');
      setJournal(raw ? JSON.parse(raw) : {});
    } catch (_) {}
    try {
      const hist = localStorage.getItem('mm_assessment_history');
      setHistory(hist ? JSON.parse(hist) : []);
    } catch (_) {}
  }, []);

  const key = useMemo(() => {
    const yyyy = viewDate.getFullYear();
    const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dd = String(viewDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [viewDate]);

  const rec = useMemo(() => (history || []).find(h => h.date === key), [history, key]);
  const note = journal?.[key]?.note || '';
  const mood = journal?.[key]?.mood;
  const moodTag = journal?.[key]?.moodTag;

  function prevDay() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  }
  function nextDay() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  }
  function today() {
    setViewDate(new Date());
  }

  const dateLabel = viewDate.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', year:'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <div style={{ fontWeight:800, fontSize:18 }}>{dateLabel}</div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="cta-btn" onClick={prevDay} style={{ color:'black' }}>◀ Prev</button>
            <button className="cta-btn" onClick={today} style={{ color:'black' }}>Today</button>
            <button className="cta-btn" onClick={nextDay} style={{ color:'black' }}>Next ▶</button>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12 }}>
        <div className="card" style={{ padding:16 }}>
          <div className="resource-title">Assessment</div>
          {rec ? (
            <div style={{ marginTop:8 }}>
              <div>D: <strong>{rec.D}</strong></div>
              <div>A: <strong>{rec.A}</strong></div>
              <div>S: <strong>{rec.S}</strong></div>
              <div style={{ marginTop:8 }}>Total: <strong>{Number(rec.D||0)+Number(rec.A||0)+Number(rec.S||0)}</strong></div>
            </div>
          ) : (
            <div className="subtle" style={{ marginTop:8 }}>No assessment saved for this date.</div>
          )}
          <div style={{ marginTop:12 }}>
            <button className="cta-btn" onClick={() => navigate('/assessment')} style={{ color:'black' }}>Take Assessment</button>
          </div>
        </div>

        <div className="card" style={{ padding:16 }}>
          <div className="resource-title">Mood</div>
          <div style={{ marginTop:8 }}>Mood: <strong>{typeof mood === 'number' ? mood : '—'}</strong>/10</div>
          {moodTag && <div style={{ marginTop:6 }}>Tag: <span className="chip small">{moodTag}</span></div>}
        </div>

        <div className="card" style={{ padding:16 }}>
          <div className="resource-title">Journal</div>
          <div style={{ marginTop:8, minHeight:80, whiteSpace:'pre-wrap', lineHeight:1.4 }}>
            {note ? note : <span className="subtle">No note for this date.</span>}
          </div>
          <div style={{ marginTop:12 }}>
            <button className="cta-btn" onClick={() => navigate(`/journal/${key}`)} style={{ color:'black' }}>Open Journal</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}