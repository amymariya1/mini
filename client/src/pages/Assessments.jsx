import { useEffect, useMemo, useState } from "react";
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
  const [responses, setResponses] = useState({}); // { [id]: 0|1|2|3 }
  const [saved, setSaved] = useState(null);

  // Load last saved responses
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

  const allAnswered = Object.keys(responses).length === DASS_ITEMS.length;

  const result = useMemo(() => {
    // Sum raw scores per subscale
    const sums = { D: 0, A: 0, S: 0 };
    for (const item of DASS_ITEMS) {
      const val = Number(responses[item.id] ?? 0);
      if (item.scale in sums) sums[item.scale] += val;
    }
    // Multiply by 2 for DASS-21 final scores
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
    <div className="landing-container">
      <Navbar />
      <main style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <header style={{ marginBottom: 16 }}>
            <h2>DASS‑21 Assessment</h2>
            <p className="subtle" style={{ marginTop: 6 }}>
              Over the past week, rate how much each statement applied to you.
              0 = Did not apply to me at all; 1 = Applied to me to some degree; 2 = Applied to a considerable degree; 3 = Applied very much.
            </p>
            <div className="subtle" style={{ marginTop: 10, fontSize: 13 }}>
              This tool is for screening only and does not provide a diagnosis. If you are in crisis or thinking about harming yourself, seek immediate help.
            </div>
          </header>

          <section className="card" style={{ padding: 16, marginBottom: 16 }}>
            <ol style={{ display: "grid", gap: 14, paddingLeft: 18 }}>
              {DASS_ITEMS.map((q) => (
                <li key={q.id}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, marginRight: 6 }}>Q{q.id}.</span>
                    {q.text}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className="chip"
                        onClick={() => setAnswer(q.id, v)}
                        style={{
                          borderColor: responses[q.id] === v ? "#2563eb" : "#e5e7eb",
                          background: responses[q.id] === v ? "#eff6ff" : undefined,
                        }}
                        title={`Select ${v}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={handleSave} disabled={!allAnswered}>Save Results</button>
              <button className="cta-btn secondary" onClick={handleReset}>Reset</button>
            </div>
          </section>

          <section className="card" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Your Scores</h3>
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
            {saved && (
              <div className="subtle" style={{ marginTop: 12, fontSize: 13 }}>
                Last saved locally. You can safely close this page and return later.
              </div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
}