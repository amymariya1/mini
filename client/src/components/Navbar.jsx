import { Link, useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showMoreServices, setShowMoreServices] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState(null);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const isLandingPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const hideNavLinks = isLandingPage || isLoginPage;

  useEffect(() => {
    // Try local cache first
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}

    // Also track Firebase auth state in case local cache is missing
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u = {
          id: fbUser.uid,
          name: fbUser.displayName || "",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || undefined,
        };
        setUser((prev) => prev || u);
      } else {
        setUser((prev) => {
          // If user explicitly logged out, clear UI
          try { const cached = localStorage.getItem("mm_user"); if (!cached) return null; } catch (_) {}
          return prev;
        });
      }
    });
    return () => unsub();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreServices && !event.target.closest('.more-services-dropdown')) {
        setShowMoreServices(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [showMoreServices, closeTimeout]);

  const hover = { y: -1, opacity: 0.9 };
  const tap = { scale: 0.98 };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          MindMirror
        </div>
        <nav className="navbar-nav">
          {!hideNavLinks && (
            <motion.span whileHover={hover} whileTap={tap}>
              <Link to="/home" className="nav-link">Home</Link>
            </motion.span>
          )}
          {!hideNavLinks && (
            <motion.span whileHover={hover} whileTap={tap}>
              <Link to="/shopping" className="nav-link">Shop</Link>
            </motion.span>
          )}
          <motion.span whileHover={hover} whileTap={tap}>
            <Link to="/about" className="nav-link">About</Link>
          </motion.span>
          <motion.span whileHover={hover} whileTap={tap}>
            <Link to="/refer-patient" className="nav-link">Refer a Patient</Link>
          </motion.span>
          {!hideNavLinks && (
            <motion.div 
              className="more-services-dropdown"
              style={{ position: 'relative' }}
              whileHover={hover} 
              whileTap={tap}
              onMouseEnter={() => {
                if (closeTimeout) {
                  clearTimeout(closeTimeout);
                  setCloseTimeout(null);
                }
                setShowMoreServices(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setShowMoreServices(false);
                  setCloseTimeout(null);
                }, 300);
                setCloseTimeout(timeout);
              }}
              onClick={() => setShowMoreServices(!showMoreServices)}
            >
              <span className="nav-link" style={{ cursor: 'pointer', transition: 'all 0.2s ease', color: showMoreServices ? (isDarkMode ? '#3b82f6' : '#2563eb') : 'inherit' }}>More Services ▾</span>
              <AnimatePresence>
              {showMoreServices && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: isDarkMode ? '#1f2937' : 'white',
                    boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    padding: '8px 0',
                    minWidth: '180px',
                    zIndex: 1000,
                    marginTop: '8px'
                  }}
                  onMouseEnter={() => {
                    if (closeTimeout) {
                      clearTimeout(closeTimeout);
                      setCloseTimeout(null);
                    }
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setShowMoreServices(false);
                      setCloseTimeout(null);
                    }, 300);
                    setCloseTimeout(timeout);
                  }}
                >
                  <Link 
                    to="/blog" 
                    className="nav-link"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: isDarkMode ? '#f3f4f6' : '#374151',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#1f2937' : 'transparent'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreServices(false);
                    }}
                  >
                    📝 Blog
                  </Link>
                  <Link 
                    to="/therapist-dashboard" 
                    className="nav-link"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: isDarkMode ? '#f3f4f6' : '#374151',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#1f2937' : 'transparent'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreServices(false);
                    }}
                  >
                    👩‍⚕️ Book Therapist
                  </Link>
                  <Link 
                    to="/assessments" 
                    className="nav-link"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: isDarkMode ? '#f3f4f6' : '#374151',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#1f2937' : 'transparent'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreServices(false);
                    }}
                  >
                    🧘 Meditation
                  </Link>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          )}
          <motion.span whileHover={hover} whileTap={tap}>
            <a href="#" className="nav-link">Contact</a>
          </motion.span>
          
          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
          
          {user ? (
            <>
              <ProfileMenu user={user} />
            </>
          ) : (
            <>
              <motion.span whileHover={hover} whileTap={tap}>
                <Link to="/login" className="nav-link">Log in</Link>
              </motion.span>
              <motion.span whileHover={hover} whileTap={tap}>
                <Link to="/signup" className="nav-link">Sign up</Link>
              </motion.span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}