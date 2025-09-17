import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { resetPassword as apiResetPassword } from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus({ ok: false, message: "Missing or invalid reset token." });
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ ok: false, message: "" });
    if (!token) {
      setStatus({ ok: false, message: "Missing or invalid reset token." });
      return;
    }
    if (!password || !confirm) {
      setStatus({ ok: false, message: "Please enter and confirm your new password." });
      return;
    }
    if (password !== confirm) {
      setStatus({ ok: false, message: "Passwords do not match." });
      return;
    }
    try {
      setLoading(true);
      await apiResetPassword({ token, password });
      setStatus({ ok: true, message: "Password updated. You can now sign in." });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Failed to reset password" });
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
          <h2 className="auth-title">Set a new password</h2>
          <p className="auth-sub">Enter your new password below</p>

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
              <div style={{ fontSize: 14, marginBottom: 6 }}>New password</div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </label>

            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Confirm password</div>
              <input
                type="password"
                name="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </label>

            <button disabled={loading} type="submit" className="cta-btn" style={{ width: "100%", marginTop: 6 }}>
              {loading ? "Updating..." : "Update password"}
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