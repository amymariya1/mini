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
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>MindMirror</div>
      <nav>
        {!hideNavLinks && (
          <motion.span whileHover={hover} whileTap={tap}>
            <Link to="/">Home</Link>
          </motion.span>
        )}
        <motion.span whileHover={hover} whileTap={tap}>
          <a href="#">About</a>
        </motion.span>
        <motion.span whileHover={hover} whileTap={tap}>
          <a href="#">Contact</a>
        </motion.span>
        {user ? (
          <ProfileMenu user={user} />
        ) : (
          <>
            <motion.span whileHover={hover} whileTap={tap}>
              <Link to="/login">Log in</Link>
            </motion.span>
            <motion.span whileHover={hover} whileTap={tap}>
              <Link to="/signup">Sign up</Link>
            </motion.span>
          </>
        )}
      </nav>
    </header>
  );
}