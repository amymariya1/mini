import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { requestPasswordResetForCurrentUser } from "../services/api";

export default function TestAPI() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  async function testDirectAPI() {
    try {
      setLoading(true);
      setDebugInfo("Testing direct API call...");
      
      // Get user email
      const userRaw = localStorage.getItem('mm_user');
      if (!userRaw) {
        throw new Error('No user logged in');
      }
      
      const user = JSON.parse(userRaw);
      if (!user.email) {
        throw new Error('User email not found');
      }
      
      setDebugInfo(`Sending request to /auth/forgot-password-auto with email: ${user.email}`);
      
      // Direct API call using fetch
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/auth/forgot-password-auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email }),
      });
      
      const result = await response.json();
      
      setDebugInfo(`Direct API call successful. Result: ${JSON.stringify(result)}`);
      setStatus({ 
        ok: true, 
        message: "Direct API call successful!" 
      });
    } catch (err) {
      console.error("Direct API call failed:", err);
      setDebugInfo(`Direct API call failed: ${err.message}`);
      setStatus({ 
        ok: false, 
        message: `Direct API call failed: ${err.message}` 
      });
    } finally {
      setLoading(false);
    }
  }

  async function testWrapperFunction() {
    try {
      setLoading(true);
      setDebugInfo("Testing wrapper function...");
      
      const result = await requestPasswordResetForCurrentUser();
      
      setDebugInfo(`Wrapper function successful. Result: ${JSON.stringify(result)}`);
      setStatus({ 
        ok: true, 
        message: "Wrapper function successful!" 
      });
    } catch (err) {
      console.error("Wrapper function failed:", err);
      setDebugInfo(`Wrapper function failed: ${err.message}`);
      setStatus({ 
        ok: false, 
        message: `Wrapper function failed: ${err.message}` 
      });
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
          <h2 className="auth-title">Test API Functions</h2>
          <p className="auth-sub">Debug page for API function testing</p>

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

          {debugInfo && (
            <div style={{ 
              background: "#f0f9ff", 
              border: "1px solid #bae6fd", 
              borderRadius: 8, 
              padding: 12, 
              marginBottom: 16,
              fontSize: 14,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap"
            }}>
              <strong>Debug Info:</strong>
              <div>{debugInfo}</div>
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            <button 
              disabled={loading} 
              onClick={testDirectAPI} 
              className="cta-btn" 
              style={{ width: "100%", marginTop: 6 }}
            >
              {loading ? "Testing..." : "Test Direct API"}
            </button>
            
            <button 
              disabled={loading} 
              onClick={testWrapperFunction} 
              className="cta-btn" 
              style={{ width: "100%", marginTop: 6 }}
            >
              {loading ? "Testing..." : "Test Wrapper Function"}
            </button>
          </div>

          <div style={{ marginTop: 14, fontSize: 14 }}>
            Back to <Link to="/home">Dashboard</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}