import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Simple profile dropdown with Framer Motion animations
export default function ProfileMenu({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initials = useMemo(() => {
    const name = user?.name || "User";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }, [user]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    try {
      // Try to sign out Firebase if used
      const { auth } = await import("../services/firebase");
      if (auth && auth.signOut) {
        await auth.signOut();
      }
    } catch (_) {}
    localStorage.removeItem("mm_user");
    setOpen(false);
    navigate("/");
  }

  return (
    <div className="profile-menu" ref={ref}>
      <button className="avatar" onClick={() => setOpen((v) => !v)} aria-label="Open profile menu">
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="menu-header">
              <div className="menu-name">{user?.name}</div>
              <div className="menu-email">{user?.email}</div>
            </div>
            <Link to="/home" className="menu-item" onClick={() => setOpen(false)}>🏠 Home</Link>
            <Link to="#" className="menu-item" onClick={() => setOpen(false)}>⚙️ Settings</Link>
            <button className="menu-item danger" onClick={logout}>↩️ Log out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}