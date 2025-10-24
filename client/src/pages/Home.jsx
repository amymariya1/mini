import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SupportChatbot from "../components/SupportChatbot";
import NotificationBanner from "../components/NotificationBanner";
import { listProducts } from "../services/api";


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
                Check-ins: {totalCheckins} • Level {level}
              </div>
            </div>

            {/* Tree */}
            <div style={{ background: "white", border: "1px solid rgba(148, 163, 184, 0.15)", borderRadius: 12, padding: 16, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: 16 }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-block", position: "relative" }}
              >
                <div
                  aria-label="wellness tree"
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
                  {/* Leaves */}
                  <div style={{ position: "absolute", top: 20, left: 20, width: 100, height: 100, borderRadius: "50%", background: activeMood.color, boxShadow: `0 6px 12px ${activeMood.color}33` }} />
                  <div style={{ position: "absolute", top: 40, left: 40, width: 60, height: 60, borderRadius: "50%", background: activeMood.color, boxShadow: `0 6px 12px ${activeMood.color}33` }} />
                  <div style={{ position: "absolute", top: 60, left: 60, width: 20, height: 20, borderRadius: "50%", background: activeMood.color, boxShadow: `0 6px 12px ${activeMood.color}33` }} />
                  {/* Trunk */}
                  <div style={{ position: "absolute", bottom: -20, left: 60, width: 20, height: 40, borderRadius: "0 0 10px 10px", background: "#111827" }} />
                </div>
              </motion.div>
              <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>Growth: {progressToNext * 100}%</div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Level Progress</div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.3)", borderRadius: "3px", overflow: "hidden" }}>
                <motion.div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #4ade80 0%, #22d3ee 50%, #a855f7 100%)",
                    borderRadius: "3px",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressToNext * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

// Shopping Tab Component
const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Meditation", value: "Meditation" },
  { name: "Sleep", value: "Sleep" },
  { name: "Yoga", value: "Yoga" },
  { name: "Aromatherapy", value: "Aromatherapy" },
  { name: "Books", value: "Books" },
  { name: "Crystals", value: "Crystals" },
  { name: "Wellness", value: "Wellness" }
];

function ShoppingTab({ onBack }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mm_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (_) {}
  }, []);

  // Persist cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('mm_cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  // Load from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await listProducts();
        const list = (data.products || []).map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice || 0,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          image: p.image || '🛍️',
          category: p.category || 'General',
          description: p.description || '',
          inStock: p.inStock !== false,
          badge: p.badge || ''
        }));
        setProducts(list);
        setFilteredProducts(list);
      } catch (err) {
        // keep empty state if API unavailable
        setProducts([]);
        setFilteredProducts([]);
      }
    }
    load();
  }, []);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => String(b.id).localeCompare(String(a.id))); // fallback if no createdAt here
        break;
      default:
        // Keep original order for "featured"
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, sortBy, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Add item and open cart immediately
  const buyNow = (product) => {
    if (!product?.inStock) return;
    addToCart(product);
    setShowCart(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="shopping-page">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "24px 24px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🛍️</span>
            <h2 style={{ margin: 0 }}>Shop</h2>
          </div>
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "2px solid #e5e7eb",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            Back
          </motion.button>
        </div>
      </motion.header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#334155" }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#334155" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#334155" }}>Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: "12px 24px" }}>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + (filteredProducts.indexOf(product) * 0.1), duration: 0.3 }}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                cursor: "pointer"
              }}
              onClick={() => handleProductClick(product.id)}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {product.image}
              </div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1f2937", marginBottom: "8px" }}>
                {product.name}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" }}>
                ${product.price.toFixed(2)}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {product.badge}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {product.rating}★ ({product.reviews} reviews)
              </div>
              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); buyNow(product); }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                Buy Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cart */}
      {showCart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Shopping Cart</h3>
              <motion.button
                type="button"
                onClick={() => setShowCart(false)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                Close
              </motion.button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + (cart.indexOf(item) * 0.1), duration: 0.3 }}
                  style={{
                    background: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      {item.image}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "#1f2937", marginBottom: "8px" }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <motion.button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "2px solid #e5e7eb",
                        background: "white",
                        color: "#374151",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                    >
                      -
                    </motion.button>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" }}>
                      {item.quantity}
                    </div>
                    <motion.button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "2px solid #e5e7eb",
                        background: "white",
                        color: "#374151",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                    >
                      +
                    </motion.button>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" }}>
                    ${item.price.toFixed(2)}
                  </div>
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "2px solid #e5e7eb",
                      background: "white",
                      color: "#374151",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}
                  >
                    Remove
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1f2937" }}>
                Total: ${getTotalPrice().toFixed(2)}
              </div>
              <motion.button
                type="button"
                onClick={() => setShowCart(false)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                Checkout
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
          return <line key={i} x1={padding} x2={width-padding} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />;
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
            <Legend color="#ef4444" label={`D: ${hover.d ?? '-'}  `} />
            <Legend color="#f59e0b" label={`A: ${hover.a ?? '-'}  `} />
            <Legend color="#8b5cf6" label={`S: ${hover.s ?? '-'}  `} />
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
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Start with null to indicate loading
  const [activeTab, setActiveTab] = useState(null); // null, 'shopping', or 'blog'
  const chatbotRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  
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

  // Load user data from localStorage and handle redirection
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_user");
      const userData = raw ? JSON.parse(raw) : {};
      setUser(userData);
      
      // If user is a therapist, redirect immediately
      if (userData?.userType === 'therapist') {
        navigate('/therapist-dashboard', { replace: true });
      }
    } catch (_) {
      setUser({});
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  // Show nothing while loading or if user is a therapist
  if (isLoading || user?.userType === 'therapist') {
    return null;
  }

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
    <div>
      <Navbar />
      <NotificationBanner />
      <div className="app-container">
        <main className="calm-main" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Tab Navigation */}
          {activeTab && (
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setActiveTab(null)}
                style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  color: '#000000'
                }}
              >
                ← Back to Home
              </button>
            </div>
          )}

          {/* Shopping Tab Content */}
          {activeTab === 'shopping' && (
            <div style={{ marginTop: '20px' }}>
              <ShoppingTab />
            </div>
          )}

          {/* Blog Tab Content */}
          {activeTab === 'blog' && (
            <div style={{ marginTop: '20px' }}>
              <p>Blog content would go here</p>
            </div>
          )}

          {/* Main Home Content (only shown when no tab is active) */}
          {!activeTab && (
            <>
              {/* Welcome Hero Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  borderRadius: '20px',
                  padding: '60px 40px',
                  marginBottom: '40px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url(https://images.pexels.com/photos/236151/pexels-photo-236151.jpeg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.6)'
                }} />
                
                {/* Dark overlay for text readability */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.4)'
                }} />
                
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }}
                />
                
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      marginBottom: '20px',
                      textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user?.name ? `Welcome back, ${user.name}! 👋` : 'Welcome to MindMirror 🧠'}
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={{
                      fontSize: '1.25rem',
                      lineHeight: '1.8',
                      maxWidth: '800px',
                      margin: '0 auto 30px',
                      opacity: 0.95
                    }}
                  >
                    Your comprehensive mental health companion. MindMirror helps you understand, track, and improve your mental well-being through evidence-based assessments, personalized insights, and professional support.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: '30px'
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => chatbotRef.current?.openChat()}
                      style={{
                        background: 'white',
                        padding: '20px 40px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{ fontSize: '2.5rem' }}
                      >
                        💬
                      </motion.div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: 800, 
                          color: '#667eea',
                          marginBottom: '5px'
                        }}>
                          AI Support Chatbot
                        </div>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          color: '#64748b'
                        }}>
                          Get instant support 24/7
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.section>

              {/* More Services Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{ marginBottom: '50px' }}
              >
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  marginBottom: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  More Services
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '30px',
                  marginBottom: '50px'
                }}>
                  {/* Blog Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    onClick={() => navigate('/blog')}
                    style={{
                      borderRadius: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
                      transition: 'all 0.3s ease',
                      height: '400px'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'url(https://images.pexels.com/photos/236151/pexels-photo-236151.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.6)'
                    }} />
                    
                    
                    <div style={{ position: 'relative', zIndex: 2, padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '15px' }}>
                        Mental Health Blog
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
                        Read expert articles, personal stories, and evidence-based tips for mental wellness. Share your journey and connect with others.
                      </p>
                      <motion.div
                        whileHover={{ x: 5 }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        Explore Blog <span>→</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Book Therapist Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    onClick={() => navigate('/appointments')}
                    style={{
                      borderRadius: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                      transition: 'all 0.3s ease',
                      height: '400px'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'url(https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.6)'
                    }} />
                    
                    
                    <div style={{ position: 'relative', zIndex: 2, padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👩‍⚕️</div>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '15px' }}>
                        Book a Therapist
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
                        Connect with licensed mental health professionals. Schedule sessions, chat securely, and get the support you deserve.
                      </p>
                      <motion.div
                        whileHover={{ x: 5 }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        Find Therapist →
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Shopping Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    onClick={() => navigate('/shopping')}
                    style={{
                      borderRadius: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
                      transition: 'all 0.3s ease',
                      height: '400px'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'url(https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.6)'
                    }} />
                    
                    
                    <div style={{ position: 'relative', zIndex: 2, padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛍️</div>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '15px' }}>
                        Wellness Shop
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
                        Discover curated products for mental wellness. From meditation tools to self-care essentials, find what helps you thrive.
                      </p>
                      <motion.div
                        whileHover={{ x: 5 }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        Browse Shop →
                      </motion.div>
                    </div>
                  </motion.div>


                </div>
              </motion.section>

              {/* Enhanced Hero Section with Motion Design */}
              <section style={{ padding: '60px 24px', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Understanding Mental Health
                  </h2>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '40px',
                    maxWidth: '700px',
                    margin: '0 auto 40px'
                  }}>
                    Learn about common mental health conditions and take the first step toward better well-being
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '0px' }}>
                    {/* Card 1 - Depression */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      whileHover={{ y: -5 }}
                      className="card" 
                      style={{ 
                        padding: '0', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0f2fe',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => navigate('/depression-detail')}
                    >
                      <div style={{ 
                        height: '200px', 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: 'url(https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'brightness(0.7)'
                        }} />
                        <div style={{
                          position: 'relative',
                          zIndex: 2,
                          background: 'rgba(14, 165, 233, 0.9)',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)'
                        }}>
                          Depression
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>Depression</h3>
                        <p style={{ color: '#0ea5e9', marginBottom: '20px', lineHeight: '1.5', fontSize: '0.95rem' }}>
                          Understand and manage feelings of sadness, hopelessness, and lack of interest in activities.
                        </p>
                        <a 
                          className="home-illus-cta-btn individual pressed"
                          style={{
                            textAlign: 'left',
                            height: '80px',
                            color: '#0c4a6e',
                            border: '1px solid #e0f2fe',
                            borderRadius: '6px',
                            marginTop: '16px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'block',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f0f9ff',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/depression-detail');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        >
                          <div className="home-illus-cta-btn-main-text" style={{ 
                            fontWeight: '600', 
                            fontSize: '0.95rem',
                            color: 'inherit',
                            marginBottom: '4px'
                          }}>
                            Learn about Depression
                          </div>
                          <div className="home-illus-cta-btn-help-text" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: '0.9rem', 
                            color: '#0ea5e9' 
                          }}>
                            For myself
                            <span className="arrow-outer" style={{ marginLeft: '8px' }}>
                              <i className="arrow-inner fa fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                            </span>
                          </div>
                        </a>
                      </div>
                    </motion.div>
                    
                    {/* Card 2 - Anxiety */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="card" 
                      style={{ 
                        padding: '0', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        border: '1px solid #fef3c7',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => navigate('/anxiety-detail')}
                    >
                      <div style={{ 
                        height: '200px', 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: 'url(https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'brightness(0.7)'
                        }} />
                        <div style={{
                          position: 'relative',
                          zIndex: 2,
                          background: 'rgba(245, 158, 11, 0.9)',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)'
                        }}>
                          Anxiety
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>Anxiety</h3>
                        <p style={{ color: '#f59e0b', marginBottom: '20px', lineHeight: '1.5', fontSize: '0.95rem' }}>
                          Manage excessive worry, fear, and nervousness that interfere with daily activities.
                        </p>
                        <a 
                          className="home-illus-cta-btn individual pressed"
                          style={{
                            textAlign: 'left',
                            height: '80px',
                            color: '#92400e',
                            border: '1px solid #fef3c7',
                            borderRadius: '6px',
                            marginTop: '16px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'block',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#fffbeb',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/anxiety-detail');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fffbeb'}
                        >
                          <div className="home-illus-cta-btn-main-text" style={{ 
                            fontWeight: '600', 
                            fontSize: '0.95rem',
                            color: 'inherit',
                            marginBottom: '4px'
                          }}>
                            Learn about Anxiety
                          </div>
                          <div className="home-illus-cta-btn-help-text" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: '0.9rem', 
                            color: '#f59e0b' 
                          }}>
                            For myself
                            <span className="arrow-outer" style={{ marginLeft: '8px' }}>
                              <i className="arrow-inner fa fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                            </span>
                          </div>
                        </a>
                      </div>
                    </motion.div>
                    
                    {/* Card 3 - Stress */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      whileHover={{ y: -5 }}
                      className="card" 
                      style={{ 
                        padding: '0', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        border: '1px solid #fce7f3',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => navigate('/stress-detail')}
                    >
                      <div style={{ 
                        height: '200px', 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: 'url(https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'brightness(0.7)'
                        }} />
                        <div style={{
                          position: 'relative',
                          zIndex: 2,
                          background: 'rgba(236, 72, 153, 0.9)',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)'
                        }}>
                          Stress
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#831843', marginBottom: '12px' }}>Stress</h3>
                        <p style={{ color: '#ec4899', marginBottom: '20px', lineHeight: '1.5', fontSize: '0.95rem' }}>
                          Reduce tension, pressure, and emotional strain from life's challenges and demands.
                        </p>
                        <a 
                          className="home-illus-cta-btn individual pressed"
                          style={{
                            textAlign: 'left',
                            height: '80px',
                            color: '#831843',
                            border: '1px solid #fce7f3',
                            borderRadius: '6px',
                            marginTop: '16px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'block',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#fdf2f8',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/stress-detail');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fce7f3'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdf2f8'}
                        >
                          <div className="home-illus-cta-btn-main-text" style={{ 
                            fontWeight: '600', 
                            fontSize: '0.95rem',
                            color: 'inherit',
                            marginBottom: '4px'
                          }}>
                            Learn about Stress
                          </div>
                          <div className="home-illus-cta-btn-help-text" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: '0.9rem', 
                            color: '#ec4899' 
                          }}>
                            For myself
                            <span className="arrow-outer" style={{ marginLeft: '8px' }}>
                              <i className="arrow-inner fa fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                            </span>
                          </div>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
        <SupportChatbot ref={chatbotRef} />
      </div>
    </div>
  );
}
