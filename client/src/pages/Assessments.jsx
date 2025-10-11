import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

// DASS-21 questionnaire: 21 items, 0-3 scale, final scores multiplied by 2
// Subscales: Depression (D), Anxiety (A), Stress (S)
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

// Severity thresholds for DASS-21 (final score after multiplying by 2)
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

export default function Assessments() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState({}); // { [id]: 0|1|2|3 }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touched, setTouched] = useState({}); // track which question IDs were clicked this session
  const [validationError, setValidationError] = useState("");

  // Load last saved responses and start at first unanswered
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_dass21");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.responses) {
          // normalize to numbers; do not mark as touched
          const normalized = Object.fromEntries(
            Object.entries(parsed.responses).map(([k, v]) => [k, v === undefined || v === null ? undefined : Number(v)])
          );
          setResponses(normalized);
          // jump to first unanswered question
          const firstUnansweredIdx = DASS_ITEMS.findIndex((q) => normalized[q.id] === undefined);
          if (firstUnansweredIdx >= 0) setCurrentIndex(firstUnansweredIdx);
        }
      }
    } catch (_) {}
  }, []);

  // Note: We intentionally compute per-question selection with `hasAnswer` below.

  const result = useMemo(() => {
    const sums = { D: 0, A: 0, S: 0 };
    for (const item of DASS_ITEMS) {
      const val = Number(responses[item.id] ?? 0);
      if (item.scale in sums) sums[item.scale] += val;
    }
    const final = {
      D: sums.D * 2,
      A: sums.A * 2,
      S: sums.S * 2,
      totalRaw: sums.D + sums.A + sums.S,
    };
    const severity = {
      Depression: getSeverity("D", final.D),
      Anxiety: getSeverity("A", final.A),
      Stress: getSeverity("S", final.S),
    };
    return { final, severity };
  }, [responses]);

  function setAnswerAndAdvance(id, value) {
    const numeric = Number(value);
    setResponses((prev) => {
      // If selecting the same value again, do nothing to avoid flicker/color changes
      if (prev[id] === numeric) return prev;
      const next = { ...prev, [id]: numeric };
      // persist progress so user can resume
      try {
        const payload = { timestamp: Date.now(), responses: next };
        localStorage.setItem("mm_assessment_dass21", JSON.stringify(payload));
      } catch (_) {}
      return next;
    });

    // mark this question as user-touched to allow highlighting (do not recreate if already true)
    setTouched((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

    // clear any validation error once an option is chosen
    setValidationError("");
  }

  function goPrev() {
    setValidationError("");
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  }

  function retake() {
    // Clear current progress and start from the first question
    setResponses({});
    setTouched({});
    setCurrentIndex(0);
    try {
      localStorage.removeItem("mm_assessment_dass21");
    } catch (_) {}
  }

  function handleSubmit() {
    const payload = { timestamp: Date.now(), responses, result };
    try {
      // Save latest snapshot
      localStorage.setItem("mm_assessment_dass21", JSON.stringify(payload));

      // Append to history (per day), keep last 30
      const today = new Date().toISOString().slice(0, 10);
      const histRaw = localStorage.getItem("mm_assessment_history");
      let history = [];
      if (histRaw) {
        try { history = JSON.parse(histRaw) || []; } catch (_) { history = []; }
      }
      const next = history.filter((h) => h.date !== today);
      next.push({ date: today, D: result.final.D, A: result.final.A, S: result.final.S });
      const trimmed = next.sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
      localStorage.setItem("mm_assessment_history", JSON.stringify(trimmed));
    } catch (_) {}

    // Return to Home and auto-expand the results section
    navigate("/home", { state: { fromAssessments: true } });
  }

  const q = DASS_ITEMS[currentIndex];
  const progress = ((currentIndex + 1) / DASS_ITEMS.length) * 100;
  const isLast = currentIndex === DASS_ITEMS.length - 1;
  // Require an explicit click on an option in this session before advancing
  const hasSelection = !!touched[q?.id];

  return (
    <div className="landing-container">
      <Navbar />
      <main style={{ padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <header style={{ marginBottom: 16, textAlign: "center" }}>
            <h2>DASS‑21 Assessment</h2>
            <p className="subtle" style={{ marginTop: 6 }}>
              Over the past week, rate how much each statement applied to you.
            </p>
            <div className="subtle" style={{ marginTop: 8, fontSize: 13 }}>
              0 = Not at all • 1 = To some degree • 2 = Considerably • 3 = Very much
            </div>
          </header>

          {/* Progress */}
          <div className="card" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>Question {currentIndex + 1} / {DASS_ITEMS.length}</div>
              <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #4ade80, #22d3ee, #a855f7)", borderRadius: 3 }}
                />
              </div>
            </div>
          </div>

          {/* Single-question card */}
          <motion.section
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ padding: 20 }}
          >
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 700, marginRight: 8, color: "#4ade80" }}>Q{q.id}.</span>
              <span style={{ color: "#374151" }}>{q.text}</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[0, 1, 2, 3].map((v) => (
                <motion.button
                  key={v}
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAnswerAndAdvance(q.id, v)}
                  className="chip"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: `2px solid ${touched[q.id] && responses[q.id] === v ? "#4ade80" : "#e5e7eb"}`,
                    background: touched[q.id] && responses[q.id] === v ? "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)" : "white",
                    color: touched[q.id] && responses[q.id] === v ? "white" : "#374151",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: touched[q.id] && responses[q.id] === v ? "0 4px 12px rgba(74, 222, 128, 0.3)" : "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                  title={`Select ${v}`}
                >
                  {v}
                </motion.button>
              ))}
            </div>

            {/* Inline validation message */}
            {validationError && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  marginTop: 12,
                  marginBottom: -4,
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #fecaca",
                  fontSize: 14,
                }}
              >
                {validationError}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "space-between" }}>
              <button
                type="button"
                className="cta-btn"
                onClick={goPrev}
                disabled={currentIndex === 0}
                style={{ color: "black" }}
              >
                Previous
              </button>

              {isLast ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="cta-btn"
                    onClick={retake}
                    title="Start over from question 1"
                    style={{ color: "black" }}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    className="cta-btn"
                    onClick={(e) => {
                      if (!hasSelection) {
                        try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
                        setValidationError("choose an option");
                        try { window.alert("choose an option"); } catch (_) {}
                        return;
                      }
                      handleSubmit();
                    }}
                    style={{ color: "black" }}
                  >
                    Submit Results
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="cta-btn"
                    onClick={retake}
                    title="Start over from question 1"
                    style={{ color: "black" }}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    className="cta-btn"
                    onClick={(e) => {
                      if (!hasSelection) {
                        try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
                        setValidationError("choose an option");
                        try { window.alert("choose an option"); } catch (_) {}
                        return;
                      }
                      setCurrentIndex((i) => Math.min(i + 1, DASS_ITEMS.length - 1));
                    }}
                    style={{ color: "black" }}
                  >
                    Next
                  </button>
                </div>
              )}

            </div>
          </motion.section>

          {/* Optional: quick preview of current totals */}
          <section className="card" style={{ padding: 16, marginTop: 12 }}>
            <div className="grid-3">
              <div className="resource">
                <div className="resource-title">Depression</div>
                <div>Score: <strong>{result.final.D}</strong></div>
                <div>Severity: <strong>{result.severity.Depression}</strong></div>
              </div>
              <div className="resource">
                <div className="resource-title">Anxiety</div>
                <div>Score: <strong>{result.final.A}</strong></div>
                <div>Severity: <strong>{result.severity.Anxiety}</strong></div>
              </div>
              <div className="resource">
                <div className="resource-title">Stress</div>
                <div>Score: <strong>{result.final.S}</strong></div>
                <div>Severity: <strong>{result.severity.Stress}</strong></div>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}