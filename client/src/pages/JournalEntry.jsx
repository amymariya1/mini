import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

// Helper to clamp value between 0-10
function clamp01(x, max = 10) {
  const n = Number(x ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

export default function JournalEntry() {
  const { date } = useParams(); // YYYY-MM-DD
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [mood, setMood] = useState(5); // 0..10
  const [moodTag, setMoodTag] = useState(""); // e.g., "Happy", "Sad"

  // Load existing note/mood for this date
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_journal");
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data[date]) {
          setNote(data[date].note || "");
          setMood(typeof data[date].mood === "number" ? data[date].mood : 5);
          setMoodTag(data[date].moodTag || "");
        }
      }
    } catch (_) {}
  }, [date]);

  function saveEntry() {
    try {
      const raw = localStorage.getItem("mm_journal");
      const data = raw ? JSON.parse(raw) : {};
      data[date] = { note: note.trim(), mood: clamp01(mood), moodTag: moodTag || "" };
      localStorage.setItem("mm_journal", JSON.stringify(data));
      navigate(-1);
    } catch (_) {}
  }

  const heading = new Date(date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="landing-container">
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Journal — {heading}</h2>
            <Link to="/calendar" className="cta-btn" style={{ color: "black" }}>Back to Calendar</Link>
          </header>

          <div className="card" style={{ padding: 16, display: "grid", gap: 16 }}>
            {/* Mood category selector */}
            <div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Mood of the day</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "Happy", emoji: "😊" },
                  { key: "Sad", emoji: "😢" },
                  { key: "Angry", emoji: "😠" },
                  { key: "Calm", emoji: "😌" },
                  { key: "Excited", emoji: "🤩" },
                  { key: "Tired", emoji: "😴" },
                  { key: "Stressed", emoji: "😣" },
                  { key: "Grateful", emoji: "🙏" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setMoodTag(opt.key)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: moodTag === opt.key ? "2px solid #9b5de5" : "1px solid #e5e7eb",
                      background: moodTag === opt.key ? "#f6f3ff" : "white",
                      color: "#374151",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: moodTag === opt.key ? "0 6px 14px rgba(155,93,229,0.12)" : "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 13 }}>{opt.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric mood slider (optional detail) */}
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Mood intensity (0-10)</div>
              <input
                type="range"
                min={0}
                max={10}
                value={mood}
                onChange={(e) => setMood(clamp01(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ marginTop: 6, fontWeight: 700 }}>Mood: {mood}/10</div>
            </label>

            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Write your note</div>
              <textarea
                rows={8}
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How was your day? What influenced your mood?"
                style={{ width: "100%", resize: "vertical" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="cta-btn" style={{ color: "black" }} onClick={saveEntry}>Save</button>
            </div>
          </div>

          <JournalPreview date={date} />
        </motion.div>
      </main>
    </div>
  );
}

// Optional: show related data for this date (assessment if saved)
function JournalPreview({ date }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const rec = useMemo(() => history.find((h) => h.date === date), [history, date]);

  if (!rec) return null;

  return (
    <div className="card" style={{ padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Assessment snapshot</div>
      <div style={{ fontSize: 14, color: "#374151" }}>D{rec.D} | A{rec.A} | S{rec.S}</div>
    </div>
  );
}