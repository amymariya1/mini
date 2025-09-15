import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function HomeTeen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
  };

  return (
    <div className="landing-container">
      <Navbar />

      <main style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.header variants={item} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: 6 }}>
              Welcome{user?.name ? ", " : ""}{user?.name || "to MindMirror"}
            </h2>
            <p className="subtle">A friendly space tailored for younger users.</p>
          </motion.header>

          <motion.section variants={item} className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>How are you today?</div>
                <div className="subtle">Pick your mood and we'll suggest helpful resources.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Awesome", emoji: "😄" },
                  { label: "Okay", emoji: "🙂" },
                  { label: "Stressed", emoji: "😣" },
                  { label: "Low", emoji: "😔" },
                ].map((m) => (
                  <button key={m.label} className="chip" title={m.label} style={{ borderColor: "#e5e7eb" }}>
                    <span style={{ fontSize: 18, marginRight: 6 }}>{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section variants={item} className="card">
            <h3 style={{ marginBottom: 8 }}>Quick tips</h3>
            <p className="subtle" style={{ marginBottom: 12 }}>Short, easy activities to help you feel better.</p>
            <div className="grid-3">
              {[
                { title: "Breathing break", desc: "Try 4-7-8 breathing for 1 minute." },
                { title: "Mini journal", desc: "Write one good thing about today." },
                { title: "Stretch", desc: "Do a 2-minute full body stretch." },
              ].map((r) => (
                <motion.a key={r.title} href="#" className="resource" whileHover={{ y: -2 }}>
                  <div className="resource-title">{r.title}</div>
                  <div className="subtle">{r.desc}</div>
                </motion.a>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}