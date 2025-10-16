import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { requestPasswordResetForCurrentUser } from "../services/api";

export default function AutoForgotPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Get user email on component mount
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('mm_user');
      console.log("AutoForgotPassword: Raw user data from localStorage:", userRaw);
      if (userRaw) {
        const user = JSON.parse(userRaw);
        console.log("AutoForgotPassword: Parsed user data:", user);
        setUserEmail(user.email || "");
      }
    } catch (error) {
      console.error("AutoForgotPassword: Error getting user email:", error);
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
      console.log("AutoForgotPassword: Sending automatic password reset request");
      
      // Add detailed logging
      console.log("AutoForgotPassword: About to call requestPasswordResetForCurrentUser");
      const result = await requestPasswordResetForCurrentUser();
      console.log("AutoForgotPassword: Got result from requestPasswordResetForCurrentUser:", result);
      
      // Check if result is valid
      if (result && typeof result === 'object') {
        console.log("AutoForgotPassword: Result is a valid object");
        setStatus({ 
          ok: true, 
          message: result.message || "If that email exists, a reset link has been sent. Please check your inbox (and spam folder)." 
        });
      } else {
        console.log("AutoForgotPassword: Result is not a valid object, using default message");
        setStatus({ 
          ok: true, 
          message: "If that email exists, a reset link has been sent. Please check your inbox (and spam folder)." 
        });
      }
      
      console.log("AutoForgotPassword: Password reset request completed successfully");
    } catch (err) {
      console.error("AutoForgotPassword: Automatic password reset request failed:", err);
      console.error("AutoForgotPassword: Error name:", err.name);
      console.error("AutoForgotPassword: Error message:", err.message);
      console.error("AutoForgotPassword: Error stack:", err.stack);
      
      // Handle specific error cases
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setStatus({ 
          ok: false, 
          message: "Network error: Unable to connect to the server. Please check your internet connection." 
        });
      } else if (err.message === 'Request timeout') {
        setStatus({ 
          ok: false, 
          message: "Request timeout: The server is taking too long to respond. Please try again." 
        });
      } else {
        setStatus({ 
          ok: false, 
          message: err.message || "Something went wrong. Please try again." 
        });
      }
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