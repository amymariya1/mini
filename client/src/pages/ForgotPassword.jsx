import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { requestPasswordReset } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ ok: false, message: "" });
    if (!email) {
      setStatus({ ok: false, message: "Please enter your email." });
      return;
    }
    try {
      setLoading(true);
      await requestPasswordReset({ email });
      setStatus({ ok: true, message: "If that email exists, a reset link has been sent." });
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-container">
      <Navbar />
      <section className="auth-wrap">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="auth-title">Reset your password</h2>
          <p className="auth-sub">We'll email you a reset link</p>

          {status.message && (
            <div style={{
              background: status.ok ? "#ecfdf5" : "#fee2e2",
              color: status.ok ? "#065f46" : "#991b1b",
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 12,
              border: status.ok ? "1px solid #a7f3d0" : "1px solid #fecaca"
            }}>{status.message}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Email</div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </label>

            <button disabled={loading} type="submit" className="cta-btn" style={{ width: "100%", marginTop: 6 }}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div style={{ marginTop: 14, fontSize: 14 }}>
            Back to <Link to="/login">Sign in</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}