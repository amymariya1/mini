import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import HomeTeen from "./pages/HomeTeen";
import Assessments from "./pages/Assessments";
import Shopping from "./pages/Shopping";
import ProductDetail from "./pages/ProductDetail";
import Chat from "./pages/Chat";
import Logout from "./pages/Logout";
import { auth } from "./services/firebase";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import ThemeLayout from "./components/ThemeLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";

function isAuthenticated() {
  try {
    const fb = !!auth.currentUser; // Firebase session
    const raw = localStorage.getItem("mm_user");
    let api = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        api = parsed && parsed.authSource === "api"; // only trust API-sourced sessions
      } catch (_) {
        api = false;
      }
    }
    return fb || api;
  } catch {
    return !!auth.currentUser;
  }
}

function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
}

function isAdminAuthenticated() {
  const token = localStorage.getItem('mm_admin_token');
  const admin = localStorage.getItem('mm_admin');
  return !!token && !!admin;
}

function RequireAdmin({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicOnly>
              <PageTransition><LandingPage /></PageTransition>
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <PageTransition><Login /></PageTransition>
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <PageTransition><Register /></PageTransition>
            </PublicOnly>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <PageTransition><Home /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/home-teen"
          element={
            <RequireAuth>
              <PageTransition><HomeTeen /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/assessments"
          element={
            <RequireAuth>
              <PageTransition><Assessments /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/shopping"
          element={
            <RequireAuth>
              <PageTransition><Shopping /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/product/:id"
          element={
            <RequireAuth>
              <PageTransition><ProductDetail /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <PageTransition><Chat /></PageTransition>
            </RequireAuth>
          }
        />
        <Route path="/logout" element={<PageTransition><Logout /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/register" element={<PageTransition><AdminRegister /></PageTransition>} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <PageTransition><AdminDashboard /></PageTransition>
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeLayout>
        <AnimatedRoutes />
      </ThemeLayout>
    </BrowserRouter>
  );
}

export default App;
