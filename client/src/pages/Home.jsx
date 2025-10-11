import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SupportChatbot from "../components/SupportChatbot";

// DASS-21 questionnaire constants (kept in sync with Assessments.jsx)
const DASS_ITEMS = [
  { id: 1, text: "I found it hard to wind down", scale: "S" },
  { id: 2, text: "I was aware of dryness of my mouth", scale: "A" },
  { id: 3, text: "I couldn't seem to experience any positive feeling at all", scale: "D" },
  { id: 4, text: "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)", scale: "A" },
  { id: 5, text: "I found it difficult to work up the initiative to do things", scale: "D" },
  { id: 6, text: "I tended to over-react to situations", scale: "S" },
  { id: 7, text: "I experienced trembling (e.g., in the hands)", scale: "A" },
  { id: 8, text: "I felt that I was using a lot of nervous energy", scale: "S" },
  { id: 9, text: "I was worried about situations in which I might panic and make a fool of myself", scale: "A" },
  { id: 10, text: "I felt that I had nothing to look forward to", scale: "D" },
  { id: 11, text: "I found myself getting agitated", scale: "S" },
  { id: 12, text: "I found it difficult to relax", scale: "S" },
  { id: 13, text: "I felt down-hearted and blue", scale: "D" },
  { id: 14, text: "I was intolerant of anything that kept me from getting on with what I was doing", scale: "S" },
  { id: 15, text: "I felt I was close to panic", scale: "A" },
  { id: 16, text: "I was unable to become enthusiastic about anything", scale: "D" },
  { id: 17, text: "I felt I wasn't worth much as a person", scale: "D" },
  { id: 18, text: "I felt that I was rather touchy", scale: "S" },
  { id: 19, text: "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)", scale: "A" },
  { id: 20, text: "I felt scared without any good reason", scale: "A" },
  { id: 21, text: "I felt that life was meaningless", scale: "D" },
];

const THRESHOLDS = {
  D: [
    { label: "Normal", max: 9 },
    { label: "Mild", max: 13 },
    { label: "Moderate", max: 20 },
    { label: "Severe", max: 27 },
    { label: "Extremely Severe", max: Infinity },
  ],
  A: [
    { label: "Normal", max: 7 },
    { label: "Mild", max: 9 },
    { label: "Moderate", max: 14 },
    { label: "Severe", max: 19 },
    { label: "Extremely Severe", max: Infinity },
  ],
  S: [
    { label: "Normal", max: 14 },
    { label: "Mild", max: 18 },
    { label: "Moderate", max: 25 },
    { label: "Severe", max: 33 },
    { label: "Extremely Severe", max: Infinity },
  ],
};

function getSeverity(scale, score) {
  const rules = THRESHOLDS[scale];
  for (const r of rules) {
    if (score <= r.max) return r.label;
  }
  return "";
}

function QuestionnaireBar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [responses, setResponses] = useState({}); // { [id]: 0|1|2|3 }
  const [saved, setSaved] = useState(null);
  const [history, setHistory] = useState([]); // [{ date: 'YYYY-MM-DD', D, A, S }]

  // Load last saved responses so Home and /assessments stay in sync
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_dass21");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.responses) setResponses(parsed.responses);
        if (parsed?.result) setSaved(parsed.result);
      }
      const histRaw = localStorage.getItem("mm_assessment_history");
      if (histRaw) setHistory(JSON.parse(histRaw));
    } catch (_) {}
  }, []);

  // Auto-expand questionnaire if coming from assessments page
  useEffect(() => {
    if (location.state?.fromAssessments) {
      setOpen(true);
      // Scroll to the Mind Check section after a short delay
      setTimeout(() => {
        const element = document.getElementById('mind-check-section');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      // Clear the state to prevent re-expanding on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const allAnswered = Object.keys(responses).length === DASS_ITEMS.length;
  const progressPercentage = (Object.keys(responses).length / DASS_ITEMS.length) * 100;

  const result = useMemo(() => {
    const sums = { D: 0, A: 0, S: 0 };
    for (const item of DASS_ITEMS) {
      const val = Number(responses[item.id] ?? 0);
      if (item.scale in sums) sums[item.scale] += val;
    }
    const final = { D: sums.D * 2, A: sums.A * 2, S: sums.S * 2, totalRaw: sums.D + sums.A + sums.S };
    const severity = {
      Depression: getSeverity("D", final.D),
      Anxiety: getSeverity("A", final.A),
      Stress: getSeverity("S", final.S),
    };
    return { final, severity };
  }, [responses]);

  function setAnswer(id, value) {
    setResponses((prev) => ({ ...prev, [id]: value }));
  }

  function handleSave() {
    const payload = { timestamp: Date.now(), responses, result };
    try {
      // Save latest snapshot
      localStorage.setItem("mm_assessment_dass21", JSON.stringify(payload));
      setSaved(result);
      
      // Append to weekly history (per day)
      const today = new Date().toISOString().slice(0,10);
      const next = history.filter(h => h.date !== today);
      next.push({ date: today, D: result.final.D, A: result.final.A, S: result.final.S });
      // Keep only last 30 entries
      const trimmed = next.sort((a,b) => a.date.localeCompare(b.date)).slice(-30);
      setHistory(trimmed);
      localStorage.setItem("mm_assessment_history", JSON.stringify(trimmed));
    } catch (_) {}
  }

  function handleReset() {
    setResponses({});
    setSaved(null);
  }

  return (
    <section id="mind-check-section" className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Enhanced Mind Check header with animations and colors */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(74, 58, 255, 0.15)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          borderBottom: open ? "1px solid rgba(255,255,255,0.2)" : "none",
          position: "relative",
          overflow: "hidden",
        }}
        aria-expanded={open}
        aria-controls="questionnaire-content"
      >
        {/* Animated background elements */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
            transform: "translateX(-100%)",
          }}
          animate={{
            transform: open ? "translateX(100%)" : "translateX(-100%)",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 2 }}>
          {/* Animated brain icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ fontSize: "24px" }}
          >
            🧠
          </motion.div>
          
          <div>
            <span style={{ 
              fontWeight: 800, 
              fontSize: "18px",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              Mind Check
            </span>
            <div style={{ 
              fontSize: 13, 
              color: "rgba(255,255,255,0.8)",
              marginTop: "2px"
            }}>
              {allAnswered ? "Complete! View results" : `${Object.keys(responses).length}/${DASS_ITEMS.length} questions answered`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ 
          position: "relative", 
          zIndex: 2, 
          display: "flex", 
          alignItems: "center", 
          gap: 12 
        }}>
          <div style={{
            width: "120px",
            height: "6px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #4ade80 0%, #22d3ee 50%, #a855f7 100%)",
                borderRadius: "3px",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <motion.span 
            aria-hidden 
            animate={{ 
              rotate: open ? 180 : 0,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            style={{ 
              display: "inline-block",
              fontSize: "20px",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {open ? "▲" : "▶"}
          </motion.span>
        </div>
      </motion.button>

      {/* Enhanced expanded content with animations */}
      <motion.div
        id="questionnaire-content"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: open ? "auto" : 0, 
          opacity: open ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ 
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
        }}
      >
        <div style={{ padding: "24px" }}>
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <div style={{ 
              fontSize: 14, 
              color: "#64748b",
              background: "rgba(255,255,255,0.8)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.2)"
            }}>
              <strong>Instructions:</strong> Over the past week, rate how much each statement applied to you. 
              <br />
              <span style={{ color: "#4ade80" }}>0 = Not at all</span> • 
              <span style={{ color: "#22d3ee" }}> 1 = To some degree</span> • 
              <span style={{ color: "#a855f7" }}> 2 = Considerably</span> • 
              <span style={{ color: "#f59e0b" }}> 3 = Very much</span>
            </div>
          </motion.header>

          <motion.ol 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ display: "grid", gap: 16, paddingLeft: 0, listStyle: "none" }}
          >
            {DASS_ITEMS.map((q, index) => (
              <motion.li 
                key={q.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + (index * 0.05), duration: 0.3 }}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(148, 163, 184, 0.1)"
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span style={{ 
                    fontWeight: 700, 
                    marginRight: 8,
                    color: "#4ade80",
                    fontSize: "16px"
                  }}>
                    Q{q.id}.
                  </span>
                  <span style={{ 
                    color: "#374151",
                    lineHeight: "1.5"
                  }}>
                    {q.text}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[0, 1, 2, 3].map((v) => (
                    <motion.button
                      key={v}
                      type="button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAnswer(q.id, v)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: `2px solid ${responses[q.id] === v ? "#4ade80" : "#e5e7eb"}`,
                        background: responses[q.id] === v 
                          ? "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)" 
                          : "white",
                        color: responses[q.id] === v ? "white" : "#374151",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: responses[q.id] === v 
                          ? "0 4px 12px rgba(74, 222, 128, 0.3)" 
                          : "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                      title={`Select ${v}`}
                    >
                      {v}
                    </motion.button>
                  ))}
                </div>
              </motion.li>
            ))}
          </motion.ol>

          {/* Enhanced action buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={{ 
              display: "flex", 
              gap: 12, 
              marginTop: 24, 
              flexWrap: "wrap",
              justifyContent: "center"
            }}
          >
            <motion.button 
              className="cta-btn" 
              onClick={handleSave} 
              disabled={!allAnswered}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: allAnswered 
                  ? "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)" 
                  : "#e5e7eb",
                color: allAnswered ? "white" : "#9ca3af",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 600,
                fontSize: "14px",
                cursor: allAnswered ? "pointer" : "not-allowed",
                boxShadow: allAnswered 
                  ? "0 4px 12px rgba(74, 222, 128, 0.3)" 
                  : "none"
              }}
            >
              {allAnswered ? "💾 Save Results" : "Complete all questions first"}
            </motion.button>
            
            <motion.button 
              className="cta-btn secondary" 
              onClick={handleReset}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "white",
                color: "#ef4444",
                border: "2px solid #ef4444",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🔄 Reset
            </motion.button>

            {/* Calendar removed from Home page as requested */}
          </motion.div>

          {/* Enhanced results section */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ 
              background: "white",
              padding: "24px", 
              marginTop: 24,
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(148, 163, 184, 0.1)"
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              marginBottom: 20 
            }}>
              <span style={{ fontSize: "24px" }}>📊</span>
              <h4 style={{ 
                margin: 0, 
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937"
              }}>
                Assessment Analysis
              </h4>
            </div>

            {/* Your Mind Check Summary strip */}
            <div className="assessment-summary-strip" style={{ marginBottom: 16 }}>
              {[
                { emoji: '😔', label: 'Depression', score: result.final.D, level: result.severity.Depression },
                { emoji: '😰', label: 'Anxiety', score: result.final.A, level: result.severity.Anxiety },
                { emoji: '😤', label: 'Stress', score: result.final.S, level: result.severity.Stress },
              ].map((item) => (
                <div key={item.label} className="assessment-pill">
                  <div className="emoji">{item.emoji}</div>
                  <div className="meta">
                    <div className="top">
                      <span className="label">{item.label}</span>
                      <span className="score">{item.score}</span>
                    </div>
                    <div className="level">{item.level}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two-column layout: left cards, right tips */}
            <div className="analysis-grid">
              {/* Left: Cards + Weekly graph */}
              <div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: 16 
                }}>
                  {[
                    { 
                      title: "Depression", 
                      score: result.final.D, 
                      severity: result.severity.Depression,
                      color: "#ef4444",
                      icon: "😔"
                    },
                    { 
                      title: "Anxiety", 
                      score: result.final.A, 
                      severity: result.severity.Anxiety,
                      color: "#f59e0b",
                      icon: "😰"
                    },
                    { 
                      title: "Stress", 
                      score: result.final.S, 
                      severity: result.severity.Stress,
                      color: "#8b5cf6",
                      icon: "😤"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                      style={{
                        background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                        padding: "20px",
                        borderRadius: "12px",
                        border: `2px solid ${item.color}20`,
                        textAlign: "center"
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                        {item.icon}
                      </div>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: "16px",
                        color: item.color,
                        marginBottom: "8px"
                      }}>
                        {item.title}
                      </div>
                      <div style={{ 
                        fontSize: "24px", 
                        fontWeight: 800,
                        color: item.color,
                        marginBottom: "4px"
                      }}>
                        {item.score}
                      </div>
                      <div style={{ 
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {item.severity}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p style={{ marginTop: 12, color: "#475569", fontSize: 13 }}>
                  Consider speaking with a licensed mental health professional for additional support.
                </p>

                {/* Weekly Graph */}
                <div style={{ marginTop: 16 }}>
                  <h5 style={{ margin: 0, fontSize: 16, color: "#1f2937", fontWeight: 700 }}>Weekly Trend</h5>
                  <p style={{ margin: "6px 0 12px", color: "#64748b", fontSize: 12 }}>Shows your last 7 days of Depression (D), Anxiety (A), and Stress (S) scores.</p>
                  <WeeklyGraph history={history} />
                </div>

                {saved && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    style={{ 
                      marginTop: 16, 
                      padding: "12px 16px",
                      background: "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: 13,
                      textAlign: "center",
                      fontWeight: 600
                    }}
                  >
                    ✅ Results saved locally! You can return later from Home or Assessments.
                  </motion.div>
                )}
              </div>

              {/* Right: Tips sidebar */}
              <aside className="card" style={{ padding: 16, alignSelf: "start" }}>
                <div style={{ fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>Tips</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Depression — tips</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    <li>Plan 1–3 small, doable activities daily (behavioral activation).</li>
                    <li>Keep a consistent wake time and 7–9h sleep.</li>
                    <li>Walk briskly 20–30 min most days; get sunlight if possible.</li>
                    <li>Use CBT reframing: notice → test → replace unhelpful thoughts.</li>
                  </ul>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Social anxiety — tips</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    <li>Use graded exposure: small steps, 3–5 times/week.</li>
                    <li>Challenge 'everyone is judging me' with balanced evidence.</li>
                    <li>Slow breathing: ~6 breaths/min for ~2 minutes.</li>
                    <li>Drop safety behaviors (over‑rehearsing, phone hiding).</li>
                  </ul>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Stress — tips</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    <li>Box breathing (4‑4‑4‑4) for 2–3 minutes.</li>
                    <li>Protect focused time; say no to low‑priority tasks.</li>
                    <li>Take 5‑min movement breaks each hour.</li>
                    <li>Progressive muscle relaxation in the evening.</li>
                  </ul>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Lifestyle anchors</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                    <li>Sleep 7–9h on a consistent schedule.</li>
                    <li>Aim for 150 min/week of moderate activity.</li>
                    <li>Regular meals; hydrate; limit caffeine after noon.</li>
                  </ul>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                  Screening only — not a diagnosis. Seek help if in crisis.
                </div>
              </aside>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </section>
  );
}

// Mood Companion Game: daily mood affects pet color; growth increases with check-ins
function MoodCompanionGame() {
  const MOODS = [
    { key: "very_sad", label: "Very Sad", icon: "😭", color: "#64748b" },
    { key: "sad", label: "Sad", icon: "😢", color: "#60a5fa" },
    { key: "neutral", label: "Neutral", icon: "😐", color: "#a78bfa" },
    { key: "happy", label: "Happy", icon: "😊", color: "#34d399" },
    { key: "very_happy", label: "Very Happy", icon: "😁", color: "#f59e0b" },
  ];

  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [log, setLog] = useState({}); // { '2025-09-18': 'happy' }

  // Load saved log
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_mood_log");
      if (raw) setLog(JSON.parse(raw));
    } catch (_) {}
  }, []);

  // Persist log
  useEffect(() => {
    try { localStorage.setItem("mm_mood_log", JSON.stringify(log)); } catch (_) {}
  }, [log]);

  function setMood(moodKey) {
    setLog(prev => ({ ...prev, [todayKey]: moodKey }));
  }

  // Helpers
  function addDays(date, delta) {
    const d = new Date(date); d.setDate(d.getDate() + delta); return d;
  }
  function fmt(d) { return new Date(d).toISOString().slice(0,10); }

  // Compute streak (consecutive days up to today)
  function computeStreak() {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const key = fmt(addDays(new Date(), -i));
      if (log[key]) streak++; else break;
    }
    return streak;
  }

  const totalCheckins = Object.keys(log).length;
  const streak = computeStreak();
  const level = Math.min(10, 1 + Math.floor(totalCheckins / 3)); // level up every 3 check-ins
  const progressToNext = (totalCheckins % 3) / 3;

  const lastKey = Object.keys(log).sort().slice(-1)[0];
  const activeMoodKey = log[todayKey] || (lastKey ? log[lastKey] : "neutral");
  const activeMood = MOODS.find(m => m.key === activeMoodKey) || MOODS[2];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(480px, 1fr))", gap: 24, width: "100%" }}>
        {/* Companion Card */}
        <section className="card" style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🐾</span>
                <h3 style={{ margin: 0 }}>Your Companion</h3>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                Streak: {streak} day{streak === 1 ? "" : "s"} • Level {level}
              </div>
            </div>

            {/* Virtual Pet */}
            <div style={{ background: "white", border: "1px solid rgba(148, 163, 184, 0.15)", borderRadius: 12, padding: 16, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: 16 }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-block", position: "relative" }}
              >
                <div
                  aria-label="virtual pet"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: activeMood.color,
                    boxShadow: `0 12px 24px ${activeMood.color}33`,
                    position: "relative",
                    margin: "0 auto"
                  }}
                >
                  {/* Eyes */}
                  <div style={{ position: "absolute", top: 52, left: 42, width: 16, height: 16, borderRadius: 8, background: "#111827" }} />
                  <div style={{ position: "absolute", top: 52, right: 42, width: 16, height: 16, borderRadius: 8, background: "#111827" }} />
                  {/* Smile */}
                  <div style={{ position: "absolute", bottom: 38, left: 0, right: 0, height: 20 }}>
                    <div style={{ width: 60, height: 30, borderBottom: "4px solid #111827", borderRadius: "0 0 60px 60px", margin: "0 auto" }} />
                  </div>
                  {/* Ears */}
                  <div style={{ position: "absolute", top: -6, left: 28, width: 28, height: 28, borderRadius: 4, transform: "rotate(-20deg)", background: activeMood.color, boxShadow: `0 6px 12px ${activeMood.color}33` }} />
                  <div style={{ position: "absolute", top: -6, right: 28, width: 28, height: 28, borderRadius: 4, transform: "rotate(20deg)", background: activeMood.color, boxShadow: `0 6px 12px ${activeMood.color}33` }} />
                </div>
              </motion.div>
              <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>Mood: {activeMood.label}</div>
            </div>

            {/* Mood Picker */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>How are you feeling today?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MOODS.map((m) => (
                  <motion.button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `2px solid ${log[todayKey] === m.key ? m.color : '#e5e7eb'}`,
                      background: log[todayKey] === m.key ? `${m.color}22` : "white",
                      color: "#111827",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                    title={m.label}
                  >
                    <span>{m.icon}</span>
                    <span style={{ fontSize: 13 }}>{m.label}</span>
                  </motion.button>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                Tip: check in daily to grow your tree and keep your streak.
              </div>
            </div>

            {/* Mini history (last 7 days) */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, color: "#64748b", width: 80 }}>Last 7 days</div>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = fmt(addDays(new Date(), -6 + i));
                  const k = log[d];
                  const mood = MOODS.find(m => m.key === k);
                  return (
                    <div key={i} title={`${d}${mood ? ' • ' + mood.label : ''}`} style={{ width: 14, height: 14, borderRadius: 999, background: mood ? mood.color : '#e5e7eb', boxShadow: mood ? `0 2px 6px ${mood.color}44` : 'none' }} />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Wellness Tree Card */}
        <section className="card" style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🌳</span>
                <h3 style={{ margin: 0 }}>Wellness Tree</h3>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                Level {level} • {totalCheckins} check-ins
              </div>
            </div>

            <div style={{ position: "relative", height: 200, marginTop: 12 }}>
              {/* Pot */}
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 110, height: 32, background: "#9ca3af", borderRadius: "6px 6px 12px 12px" }} />
              {/* Stem */}
              <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", width: 12, height: 20 + level * 12, background: "#16a34a", borderRadius: 6, boxShadow: "0 6px 12px rgba(22,163,74,0.25)" }} />
              {/* Leaves based on level */}
              {Array.from({ length: level }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  style={{
                    position: "absolute",
                    bottom: 48 + i * 12,
                    left: `calc(50% - ${24 + (i % 2 ? 16 : -16)}px)`,
                    width: 26,
                    height: 26,
                    background: "#22c55e",
                    borderRadius: "50%",
                    boxShadow: "0 6px 12px rgba(34,197,94,0.25)"
                  }}
                />
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>Growth towards next level</div>
            <div style={{ marginTop: 8, height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
              <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#4ade80,#22d3ee)", width: `${progressToNext * 100}%` }} />
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

// Weekly Graph component for last 7 days of D/A/S
function WeeklyGraph({ history }) {
  // build last 7 day labels
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0,10);
  });

  // map to data arrays; fill missing with null for gaps
  const dataD = days.map(d => history.find(h => h.date === d)?.D ?? null);
  const dataA = days.map(d => history.find(h => h.date === d)?.A ?? null);
  const dataS = days.map(d => history.find(h => h.date === d)?.S ?? null);

  const width = 520;
  const height = 200;
  const padding = 32;
  const maxY = Math.max(10, ...(history.map(h => Math.max(h.D, h.A, h.S))), 42); // safe max
  const scaleX = (idx) => padding + (idx * (width - padding*2) / 6);
  const scaleY = (val) => height - padding - (val / maxY) * (height - padding*2);

  // Generate smooth path using cubic Bezier between points
  function toSmoothPath(data) {
    const pts = data.map((v, i) => v == null ? null : [scaleX(i), scaleY(v)]).filter(Boolean);
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0][0]},${pts[0][1]}`;
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx0 = x0 + (x1 - x0) / 2;
      const cy0 = y0;
      const cx1 = x0 + (x1 - x0) / 2;
      const cy1 = y1;
      d += ` C ${cx0},${cy0} ${cx1},${cy1} ${x1},${y1}`;
    }
    return d;
  }

  const pathD = toSmoothPath(dataD);
  const pathA = toSmoothPath(dataA);
  const pathS = toSmoothPath(dataS);

  // Tooltip state
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null); // { index, x, y, d, a, s, date }

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // nearest day index by x
    const step = (width - padding*2) / 6;
    let idx = Math.round((x - padding) / step);
    idx = Math.max(0, Math.min(6, idx));
    const date = days[idx];
    const d = dataD[idx];
    const a = dataA[idx];
    const s = dataS[idx];
    setHover({ index: idx, x: scaleX(idx), y: 0, d, a, s, date });
  }

  function onLeave() { setHover(null); }

  return (
    <div style={{ background: "white", border: "1px solid rgba(148, 163, 184, 0.15)", borderRadius: 12, padding: 12 }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
           onMouseMove={onMove} onMouseLeave={onLeave}>
        {/* grid lines */}
        {[0,1,2,3,4].map(i => {
          const y = padding + i * ((height - padding*2)/4);
          return <line key={i} x1={padding} x2={width-padding} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
        })}

        {/* axes */}
        <line x1={padding} x2={padding} y1={padding} y2={height-padding} stroke="#cbd5e1" />
        <line x1={padding} x2={width-padding} y1={height-padding} y2={height-padding} stroke="#cbd5e1" />

        {/* paths (animated) */}
        <motion.path d={pathD} fill="none" stroke="#ef4444" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={pathA} fill="none" stroke="#f59e0b" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.1 }} />
        <motion.path d={pathS} fill="none" stroke="#8b5cf6" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />

        {/* hover guideline */}
        {hover && (
          <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="#94a3b8" strokeDasharray="4 4" />
        )}

        {/* dots */}
        {dataD.map((v,i)=> v==null? null : <circle key={`d${i}`} cx={scaleX(i)} cy={scaleY(v)} r={hover?.index===i?4:3} fill="#ef4444" />)}
        {dataA.map((v,i)=> v==null? null : <circle key={`a${i}`} cx={scaleX(i)} cy={scaleY(v)} r={hover?.index===i?4:3} fill="#f59e0b" />)}
        {dataS.map((v,i)=> v==null? null : <circle key={`s${i}`} cx={scaleX(i)} cy={scaleY(v)} r={hover?.index===i?4:3} fill="#8b5cf6" />)}

        {/* x labels */}
        {days.map((d, i) => (
          <text key={d} x={scaleX(i)} y={height - padding + 16} textAnchor="middle" fontSize="10" fill="#64748b">
            {d.slice(5)}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      {hover && (
        <div style={{ marginTop: 8, padding: "8px 10px", background: "#0f172a", color: "white", borderRadius: 8, fontSize: 12, display: 'inline-block' }}>
          <div style={{ opacity: 0.8 }}>{hover.date}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Legend color="#ef4444" label={`D: ${hover.d ?? '-'}`} />
            <Legend color="#f59e0b" label={`A: ${hover.a ?? '-'}`} />
            <Legend color="#8b5cf6" label={`S: ${hover.s ?? '-'}`} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Legend color="#ef4444" label="Depression" />
        <Legend color="#f59e0b" label="Anxiety" />
        <Legend color="#8b5cf6" label="Stress" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
      <span style={{ width: 12, height: 3, background: color, display: 'inline-block', borderRadius: 2 }} />
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Cached assessment result and personalized tips for hero section
  const savedAssessment = useMemo(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_dass21");
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (payload?.result?.final && payload?.result?.severity) return payload.result;
      if (payload?.responses) {
        const sums = { D: 0, A: 0, S: 0 };
        for (const item of DASS_ITEMS) {
          const val = Number(payload.responses[item.id] ?? 0);
          if (item.scale in sums) sums[item.scale] += val;
        }
        const final = { D: sums.D * 2, A: sums.A * 2, S: sums.S * 2, totalRaw: sums.D + sums.A + sums.S };
        const severity = {
          Depression: getSeverity("D", final.D),
          Anxiety: getSeverity("A", final.A),
          Stress: getSeverity("S", final.S),
        };
        return { final, severity };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const showProNote = useMemo(() => {
    if (!savedAssessment) return false;
    const { D, A, S } = savedAssessment.final;
    // "Moderate" or higher thresholds for DASS-21
    return D >= 14 || A >= 10 || S >= 19;
  }, [savedAssessment]);

  const TIPS = useMemo(() => ({
    depression: [
      "Plan 1–3 small, doable activities daily (behavioral activation).",
      "Keep a consistent wake time and 7–9h sleep.",
      "Walk briskly 20–30 min most days; get sunlight if possible.",
      "Use CBT reframing: notice → test → replace unhelpful thoughts.",
    ],
    anxiety: [
      "Use graded exposure: small steps, 3–5 times/week.",
      "Challenge 'everyone is judging me' with balanced evidence.",
      "Slow breathing: ~6 breaths/min for ~2 minutes.",
      "Drop safety behaviors (over‑rehearsing, phone hiding).",
    ],
    stress: [
      "Box breathing (4‑4‑4‑4) for 2–3 minutes.",
      "Protect focused time; say no to low‑priority tasks.",
      "Take 5‑min movement breaks each hour.",
      "Progressive muscle relaxation in the evening.",
    ],
    universal: [
      "Sleep 7–9h on a consistent schedule.",
      "Aim for 150 min/week of moderate activity.",
      "Regular meals; hydrate; limit caffeine after noon.",
    ],
  }), []);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  }, []);

  // Sidebar state for mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = (e) => {
      setIsMobile(e.matches);
      setSidebarOpen(!e.matches);
    };
    onChange(mq);
    try { mq.addEventListener('change', onChange); } catch { mq.addListener(onChange); }
    return () => { try { mq.removeEventListener('change', onChange); } catch { mq.removeListener(onChange); } };
  }, []);

  // Get the highest severity level for personalized greeting
  const getGreetingMessage = () => {
    if (!savedAssessment) return "Welcome back";
    
    const { Depression, Anxiety, Stress } = savedAssessment.severity;
    const levels = [Depression, Anxiety, Stress];
    const highestLevel = levels.includes("Extremely Severe") ? "Extremely Severe" :
                       levels.includes("Severe") ? "Severe" :
                       levels.includes("Moderate") ? "Moderate" :
                       levels.includes("Mild") ? "Mild" : "Normal";
    
    if (highestLevel === "Normal") {
      return "You're doing great today!";
    } else if (highestLevel === "Mild") {
      return "Take a moment for yourself today";
    } else {
      return "We're here to support you";
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="landing-content">
        <Navbar />

        {/* Sidebar */}
        <aside className="sidebar" style={{
          position: 'fixed', top: 64, left: 0, bottom: 0, width: sidebarOpen ? 240 : 0,
          background: '#ffffff', borderRight: '1px solid #e5e7eb',
          padding: sidebarOpen ? '16px' : '16px 0', zIndex: 10,
          overflow: 'hidden', transition: 'width 200ms ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#475569' }}>Menu</div>
            {isMobile && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSidebarOpen(v=>!v)}>Toggle</button>
            )}
          </div>
          <nav style={{ display: 'grid', gap: 8 }}>
            <Link to="/shopping" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
              <span>🛍️</span>
              <span>Shopping</span>
            </Link>
            <Link to="/blog" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
              <span>📝</span>
              <span>Blog</span>
            </Link>
            <Link to="/calendar" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
              <span>📅</span>
              <span>Calendar</span>
            </Link>
            <Link to="/habits" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
              <span>✅</span>
              <span>Habit Tracker</span>
            </Link>
          </nav>
        </aside>
        
        {/* Greeting (offset for sidebar) */}
        <div style={{ padding: '12px 24px', marginLeft: sidebarOpen ? 260 : 20 }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              textAlign: 'center',
              background: '#ffffff',
              color: '#000000',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}
          >
            {user?.name ? `Hello, ${user.name}` : 'Welcome back'}
          </h2>
        </div>

        <main className="calm-main" style={{ marginLeft: sidebarOpen ? 260 : 20, padding: '24px' }}>
          {/* Simple Hero Section */}
          <section style={{ textAlign: 'center', padding: '40px 0', borderBottom: '1px solid #e9ecef', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#000000', marginBottom: '16px' }}>
              {getGreetingMessage()}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6c757d', maxWidth: '600px', margin: '0 auto 32px' }}>
              Take a moment for your mental wellness. Your journey starts here.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/assessments')}
                style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef', color: '#000000', padding: '12px 24px' }}
              >
                🧠 Mind Check
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/journal')}
                style={{ padding: '12px 24px' }}
              >
                📝 Journal
              </button>
            </div>
          </section>

          {/* Quick Access Section */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000', marginBottom: '24px', textAlign: 'center' }}>
              Quick Access
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div 
                className="card" 
                style={{ padding: '24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/shopping')}
              >
                <span style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}>🛍️</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Wellness Shop</h3>
                <p style={{ color: '#6c757d', marginBottom: '16px' }}>Discover products to support your mental wellness journey</p>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  Explore Shop
                </button>
              </div>
              
              <div 
                className="card" 
                style={{ padding: '24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/chat')}
              >
                <span style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}>💬</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Community Chat</h3>
                <p style={{ color: '#6c757d', marginBottom: '16px' }}>Connect with others on similar wellness journeys</p>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  Join Chat
                </button>
              </div>
              
              <div 
                className="card" 
                style={{ padding: '24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/blog')}
              >
                <span style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}>📚</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Wellness Blog</h3>
                <p style={{ color: '#6c757d', marginBottom: '16px' }}>Read articles and tips from mental health experts</p>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  Read Blog
                </button>
              </div>
            </div>
          </section>

          {/* Daily Meditation Section */}
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000' }}>Daily Meditation</h2>
              <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                10 min
              </div>
            </div>
            
            <div 
              className="card" 
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/meditation')}
            >
              <div style={{ height: '200px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '4rem' }}>🧘</span>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Morning Mindfulness</h3>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  Start your day with clarity and intention through this guided mindfulness practice.
                </p>
                <button className="btn btn-primary" style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef', color: '#000000', padding: '10px 16px', width: 'fit-content' }}>
                  ▶ Play Meditation
                </button>
              </div>
            </div>
          </section>

          {/* Sleep Stories Section */}
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000' }}>Sleep Stories</h2>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                onClick={() => navigate('/sleep')}
              >
                See all →
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div 
                className="card" 
                style={{ border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/sleep')}
              >
                <div style={{ height: '160px', backgroundColor: '#f8f9fa', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#000000', fontWeight: '600', fontSize: '0.8rem' }}>
                    NORTHERN TRAIN
                  </div>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      ⭐
                    </div>
                    <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '2px 6px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      8.9 ★
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#000000', marginBottom: '4px' }}>Northern Train Journey</h3>
                  <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                    Relax as you journey through the peaceful landscapes of the north.
                  </p>
                </div>
              </div>
              
              <div 
                className="card" 
                style={{ border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/sleep')}
              >
                <div style={{ height: '160px', backgroundColor: '#f8f9fa', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#000000', fontWeight: '600', fontSize: '0.8rem' }}>
                    IRISH COUNTRYSIDE
                  </div>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      ⭐
                    </div>
                    <div style={{ backgroundColor: '#f8f9fa', color: '#000000', padding: '2px 6px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      9.2 ★
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#000000', marginBottom: '4px' }}>Irish Countryside</h3>
                  <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                    Drift off to sleep while exploring the serene beauty of Ireland.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mind Check Section */}
          <section className="mind-check-section">
            <QuestionnaireBar />
            <MoodCompanionGame />
          </section>

          {/* CTA Section */}
          <section style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#000000', marginBottom: '16px' }}>
              Ready to Take Control of Your Mental Wellness?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d', maxWidth: '600px', margin: '0 auto 32px' }}>
              Start your journey of self-discovery and personal growth with our comprehensive mental health assessment and personalized wellness tools.
            </p>
            <div>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/assessments')}
                style={{ backgroundColor: '#000000', color: 'white', padding: '12px 24px', fontSize: '1rem' }}
              >
                Start My Wellness Journey
              </button>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6c757d', fontSize: '0.9rem' }}>
              <span>🔒</span>
              <span>Your data is private and secure - take control of your mental wellness journey</span>
            </div>
          </section>

          {/* Explore by Content */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000', marginBottom: '24px', textAlign: 'center' }}>
              Explore by Content
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div 
                className="card" 
                style={{ padding: '32px 24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/meditation')}
              >
                <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>🧘</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000' }}>Meditation</h3>
              </div>

              <div 
                className="card" 
                style={{ padding: '32px 24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/sleep')}
              >
                <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>🌙</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000' }}>Sleep</h3>
              </div>

              <div 
                className="card" 
                style={{ padding: '32px 24px', textAlign: 'center', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/music')}
              >
                <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>🎵</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000' }}>Music</h3>
              </div>
            </div>
          </section>

        </main>
        <SupportChatbot />
      </div>
    </div>
  );
}

