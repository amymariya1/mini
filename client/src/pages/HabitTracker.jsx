import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Local storage helpers
const HABITS_KEY = "mm_habits";

function loadHabits() {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {}
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(base = new Date()) {
  // Return a 7-day array (Mon..Sun) around the current week of `base` date
  const day = base.getDay(); // 0=Sun .. 6=Sat
  const mondayOffset = (day === 0 ? -6 : 1 - day);
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayOffset);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState(() => loadHabits());
  const [newHabit, setNewHabit] = useState("");
  const [today] = useState(() => formatDate(new Date()));

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  function addHabit(e) {
    e?.preventDefault?.();
    const name = newHabit.trim();
    if (!name) return;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setHabits((prev) => [...prev, { id, name, history: {} }]);
    setNewHabit("");
  }

  function removeHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function toggleToday(id) {
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h;
      const done = !!h.history?.[today];
      const nh = { ...h, history: { ...(h.history || {}) } };
      if (done) delete nh.history[today]; else nh.history[today] = true;
      return nh;
    }));
  }

  function streakCount(history) {
    // Count backward streak including today
    let count = 0;
    const base = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const key = formatDate(d);
      if (history?.[key]) count += 1; else break;
    }
    return count;
  }

  const week = useMemo(() => getWeekDates(new Date()), []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 8 }}>Habit Tracker</h2>
      <p className="subtle" style={{ marginBottom: 16 }}>Daily check-ins inspired by MoodPrism: keep consistent habits and see weekly progress.</p>

      {/* Add habit */}
      <form onSubmit={addHabit} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Add a habit (e.g., Meditate, Walk 20 min)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="cta-btn" style={{ color: "black" }}>Add</button>
      </form>

      {/* Today */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 style={{ marginBottom: 12 }}>Today: {today}</h3>
        </div>
        {habits.length === 0 ? (
          <div className="subtle">No habits yet. Add your first habit above.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {habits.map((h) => {
              const isDone = !!h.history?.[today];
              const streak = streakCount(h.history || {});
              return (
                <div key={h.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      id={`cb_${h.id}`}
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleToday(h.id)}
                    />
                    <label htmlFor={`cb_${h.id}`} style={{ cursor: "pointer" }}>{h.name}</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="subtle">Streak: {streak} day{streak === 1 ? "" : "s"}</span>
                    <button className="secondary-btn" onClick={() => removeHabit(h.id)}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Week overview */}
      <section>
        <h3 style={{ marginBottom: 12 }}>This Week</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Habit</th>
                {week.map((d) => {
                  const label = d.toLocaleDateString(undefined, { weekday: "short" });
                  return <th key={d.toISOString()} style={{ textAlign: "center", padding: 8 }}>{label}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td style={{ padding: 8 }}>{h.name}</td>
                  {week.map((d) => {
                    const key = formatDate(d);
                    const done = !!h.history?.[key];
                    return (
                      <td key={key} style={{ padding: 8, textAlign: "center" }}>
                        <div
                          title={key}
                          style={{
                            display: "inline-block",
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            background: done ? "#10b981" : "#e5e7eb",
                            border: "1px solid #d1d5db",
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}