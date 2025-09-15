import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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

  // Load last saved responses so Home and /assessments stay in sync
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_dass21");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.responses) setResponses(parsed.responses);
        if (parsed?.result) setSaved(parsed.result);
      }
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
      localStorage.setItem("mm_assessment_dass21", JSON.stringify(payload));
      setSaved(result);
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
                Your Mental Health Assessment
              </h4>
            </div>
            
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
          </motion.section>
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  }, []);

  return (
    <div className="calm-home">
      {/* Calm Background */}
      <div className="calm-bg">
        <div className="nature-scene">
          <div className="mountain-range"></div>
          <div className="lake-water"></div>
          <div className="floating-particles"></div>
        </div>
      </div>

      <div className="calm-content">
        <Navbar />
        
        <main className="calm-main">
          {/* Calm Hero Section */}
          <section className="calm-hero">
            <motion.div
              className="calm-hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="breathing-prompt">
                <h1>Check your mental wellness</h1>
                <p className="calm-subtitle">Welcome back{user?.name ? `, ${user.name}` : ''} to your peaceful space</p>
                <motion.div 
                  className="breathing-circle"
                  onClick={() => navigate('/assessments')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="breath-inner"></div>
                  <div className="breath-text">Mind Check</div>
                </motion.div>
              </div>
              
              <div className="calm-actions">
                <motion.button 
                  className="calm-primary-btn"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Meditating</span>
                  <div className="btn-icon">🧘</div>
                </motion.button>
                <motion.button 
                  className="calm-secondary-btn"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Sleep Stories</span>
                  <div className="btn-icon">🌙</div>
                </motion.button>
              </div>
            </motion.div>
          </section>

          {/* Quick Access Section */}
          <section className="quick-access">
            <motion.div
              className="quick-access-content"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="quick-access-header">
                <h2>Quick Access</h2>
                <p>Explore our wellness tools and resources</p>
              </div>
              
              <div className="quick-access-grid">
                <motion.div
                  className="quick-access-card shopping"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="card-icon">🛍️</div>
                  <h3>Shopping</h3>
                  <p>Discover wellness products and meditation tools</p>
                  <motion.button 
                    className="card-btn"
                    onClick={() => navigate('/shopping')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Store
                  </motion.button>
                </motion.div>

                <motion.div
                  className="quick-access-card chat"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="card-icon">💬</div>
                  <h3>Chat</h3>
                  <p>Connect with our wellness community</p>
                  <motion.button 
                    className="card-btn"
                    onClick={() => navigate('/chat')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Chat
                  </motion.button>
                </motion.div>

                <motion.div
                  className="quick-access-card blog"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="card-icon">📝</div>
                  <h3>Blog</h3>
                  <p>Read articles on mental health and wellness</p>
                  <motion.button 
                    className="card-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Read Articles
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Daily Meditation Section */}
          <section className="daily-meditation">
            <motion.div
              className="daily-content"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="daily-header">
                <h2>Today's Meditation</h2>
                <span className="daily-duration">10 min</span>
              </div>
              <div className="meditation-card">
                <div className="meditation-image">
                  <div className="meditation-scene">
                    <div className="zen-garden"></div>
                    <div className="meditation-icon">🧘‍♀️</div>
                  </div>
                  <div className="meditation-overlay">
                    <span className="meditation-title">Morning Mindfulness</span>
                    <div className="premium-badge">🔒</div>
                  </div>
                </div>
                <div className="meditation-info">
                  <h3>Start Your Day with Clarity</h3>
                  <p>Begin your morning with this gentle meditation to set a peaceful tone for your day.</p>
                  <motion.button 
                    className="play-btn"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>▶</span>
                    <span>Play Now</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Sleep Stories Section */}
          <section className="sleep-stories">
            <motion.div
              className="sleep-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Popular Sleep Stories</h2>
              <a href="#" className="see-all-link">See All</a>
            </motion.div>

            <div className="sleep-grid">
              <motion.div
                className="sleep-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="sleep-image">
                  <div className="sleep-scene train">
                    <div className="train-tracks"></div>
                    <div className="night-sky"></div>
                  </div>
                  <div className="sleep-overlay">
                    <span className="sleep-title">THE NORDLAND NIGHT TRAIN</span>
                    <div className="sleep-badge">
                      <span className="premium-icon">🔒</span>
                    </div>
                  </div>
                </div>
                <div className="sleep-info">
                  <h3>The Nordland Night Train</h3>
                  <p>Erik Braa</p>
                </div>
              </motion.div>

              <motion.div
                className="sleep-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="sleep-image">
                  <div className="sleep-scene ireland">
                    <div className="irish-landscape"></div>
                    <div className="actor-portrait"></div>
                  </div>
                  <div className="sleep-overlay">
                    <span className="sleep-title">CROSSING IRELAND BY TRAIN</span>
                    <div className="sleep-badge">
                      <span className="premium-icon">🔒</span>
                      <span className="popularity">89.9K</span>
                    </div>
                  </div>
                </div>
                <div className="sleep-info">
                  <h3>Crossing Ireland by</h3>
                  <p>Cillian Murphy</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Explore by Content */}
          <section className="explore-content">
            <motion.div
              className="explore-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Explore by Content</h2>
            </motion.div>

            <div className="content-categories">
              <motion.div
                className="category-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="category-icon meditation-icon">🧘</div>
                <h3>Meditation</h3>
              </motion.div>

              <motion.div
                className="category-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="category-icon sleep-icon">🌙</div>
                <h3>Sleep</h3>
              </motion.div>

              <motion.div
                className="category-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="category-icon music-icon">🎵</div>
                <h3>Music</h3>
              </motion.div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}