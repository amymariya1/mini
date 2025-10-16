import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // Default to upcoming appointments

  useEffect(() => {
    // Try to get user from localStorage
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
      }
    } catch (_) {
      // If there's no user, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // If there's no user, don't render anything (redirecting)
  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Navbar with LandingPage theme */}
      <header className="navbar" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="navbar-content">
          <div 
            className="navbar-brand" 
            onClick={() => navigate("/")} 
            style={{ cursor: "pointer", fontWeight: '700', fontSize: '1.5rem' }}
          >
            MindMirror
          </div>
          <nav className="navbar-nav">
            <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
              <button 
                className="nav-link"
                onClick={() => setActiveTab("upcoming")}
                style={{ 
                  background: activeTab === "upcoming" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: activeTab === "upcoming" ? '600' : 'normal'
                }}
              >
                Upcoming Appointments
              </button>
            </motion.span>
            <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
              <button 
                className="nav-link"
                onClick={() => setActiveTab("post")}
                style={{ 
                  background: activeTab === "post" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: activeTab === "post" ? '600' : 'normal'
                }}
              >
                Post Appointments
              </button>
            </motion.span>
            <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
              <button 
                className="nav-link"
                onClick={() => navigate("/home")}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </motion.span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.25 }} 
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0 }}>Therapist Dashboard</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#64748b" }}>Welcome, {user.name}</span>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "upcoming" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e3a8a" }}>Upcoming Appointments</h3>
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                    You have no upcoming appointments scheduled.
                  </p>
                  <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                    Appointments will appear here once clients book sessions with you.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "post" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e3a8a" }}>Post Appointments</h3>
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                    No completed appointments yet.
                  </p>
                  <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                    Completed sessions and follow-ups will appear here.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
