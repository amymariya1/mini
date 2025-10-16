import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { requestPasswordResetForCurrentUser } from "../services/api";

export default function TestAutoForgotPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Get user email on component mount
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('mm_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setUserEmail(user.email || "");
      }
    } catch (error) {
      console.error("Error getting user email:", error);
      setStatus({ 
        ok: false, 
        message: "Unable to retrieve user information. Please try again or contact support." 
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ ok: false, message: "" });
    
    try {
      setLoading(true);
      console.log("Sending automatic password reset request");
      await requestPasswordResetForCurrentUser();
      setStatus({ 
        ok: true, 
        message: "A reset link has been sent to your registered email address. Please check your inbox (and spam folder)." 
      });
      console.log("Automatic password reset request sent successfully");
    } catch (err) {
      console.error("Automatic password reset request failed:", err);
      setStatus({ ok: false, message: err.message || "Something went wrong. Please try again." });
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
          <h2 className="auth-title">Test Auto Reset Password</h2>
          <p className="auth-sub">This is a test page for automatic password reset</p>

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

          {userEmail && (
            <div style={{ marginBottom: 20 }}>
              <p>Reset link will be sent to: <strong>{userEmail}</strong></p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <button disabled={loading} type="submit" className="cta-btn" style={{ width: "100%", marginTop: 6 }}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div style={{ marginTop: 14, fontSize: 14 }}>
            Back to <Link to="/home">Dashboard</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}