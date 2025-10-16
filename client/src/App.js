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
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import BlogMine from "./pages/BlogMine";
import Logout from "./pages/Logout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrderConfirmation from "./pages/OrderConfirmation";
import { auth } from "./services/firebase";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import ThemeLayout from "./components/ThemeLayout";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Calendar from "./pages/Calendar";
import JournalEntry from "./pages/JournalEntry";
import HabitTracker from "./pages/HabitTracker";
import CheckoutAddress from "./pages/CheckoutAddress";
import Inventory from "./pages/Inventory";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistRegister from "./pages/TherapistRegister";
import AutoForgotPassword from "./pages/AutoForgotPassword";
import TestAutoForgotPassword from "./pages/TestAutoForgotPassword";
import DebugAutoForgotPassword from "./pages/DebugAutoForgotPassword";
import TestAPI from "./pages/TestAPI"; // ✅ added import
import ReferPatient from "./pages/ReferPatient";
import About from "./pages/About";
import Therapists from "./pages/Therapists"; // ✅ added import

function isAuthenticated() {
  try {
    const fb = !!auth.currentUser;
    const raw = localStorage.getItem("mm_user");
    let api = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        api = parsed && parsed.authSource === "api";
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

// ✅ Admin authentication check
function isAdminAuthenticated() {
  const token = localStorage.getItem("mm_admin_token");
  const admin = localStorage.getItem("mm_admin");
  return !!token && !!admin;
}

// ✅ Protect admin routes (redirect to admin login if not authenticated)
function RequireAdmin({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicOnly>
              <PageTransition><LandingPage /></PageTransition>
            </PublicOnly>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition><About /></PageTransition>
          }
        />
        <Route
          path="/refer-patient"
          element={
            <PageTransition><ReferPatient /></PageTransition>
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
        
        {/* Authenticated User Routes */}
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
          path="/checkout/address"
          element={
            <RequireAuth>
              <PageTransition><CheckoutAddress /></PageTransition>
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
          path="/wishlist"
          element={
            <RequireAuth>
              <PageTransition><Wishlist /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <PageTransition><Orders /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <RequireAuth>
              <PageTransition><CheckoutPayment /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/confirmation"
          element={
            <RequireAuth>
              <PageTransition><OrderConfirmation /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireAuth>
              <PageTransition><Calendar /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/habits"
          element={
            <RequireAuth>
              <PageTransition><HabitTracker /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/journal/:date"
          element={
            <RequireAuth>
              <PageTransition><JournalEntry /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/auto-forgot-password"
          element={
            <RequireAuth>
              <PageTransition><AutoForgotPassword /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/test-auto-forgot-password"
          element={
            <RequireAuth>
              <PageTransition><TestAutoForgotPassword /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/debug-auto-forgot-password"
          element={
            <RequireAuth>
              <PageTransition><DebugAutoForgotPassword /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/test-api"
          element={
            <RequireAuth>
              <PageTransition><TestAPI /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/blog"
          element={
            <RequireAuth>
              <PageTransition><Blog /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/blog/mine"
          element={
            <RequireAuth>
              <PageTransition><BlogMine /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <RequireAuth>
              <PageTransition><BlogDetail /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/therapists"
          element={
            <RequireAuth>
              <PageTransition><Therapists /></PageTransition>
            </RequireAuth>
          }
        />
        
        {/* ✅ Therapist Dashboard Route */}
        <Route
          path="/therapist-dashboard"
          element={
            <RequireAuth>
              <PageTransition><TherapistDashboard /></PageTransition>
            </RequireAuth>
          }
        />
        
        {/* ✅ Therapist Registration Route */}
        <Route
          path="/therapist-register"
          element={
            <PublicOnly>
              <PageTransition><TherapistRegister /></PageTransition>
            </PublicOnly>
          }
        />
        
        {/* ✅ Therapist Route */}
        <Route
          path="/therapist"
          element={
            <RequireAuth>
              <Navigate to="/therapist-dashboard" replace />
            </RequireAuth>
          }
        />

        <Route path="/logout" element={<PageTransition><Logout /></PageTransition>} />

        {/* ✅ Admin Routes */}
        <Route path="/admin/register" element={<PageTransition><AdminRegister /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <PageTransition><AdminDashboard /></PageTransition>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <RequireAdmin>
              <PageTransition><Inventory /></PageTransition>
            </RequireAdmin>
          }
        />

        {/* Catch-all */}
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
