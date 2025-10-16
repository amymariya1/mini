import { Link, useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
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
              <Link to="/" className="nav-link">Home</Link>
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
          <motion.span whileHover={hover} whileTap={tap}>
            <a href="#" className="nav-link">Contact</a>
          </motion.span>
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