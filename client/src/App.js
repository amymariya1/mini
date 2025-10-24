import { useState, useEffect } from "react";
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
import TherapistCalendar from "./pages/TherapistCalendar";
import TherapistRegister from "./pages/TherapistRegister";
import BookTherapist from "./pages/BookTherapist";
import AutoForgotPassword from "./pages/AutoForgotPassword";
import TestAutoForgotPassword from "./pages/TestAutoForgotPassword";
import DebugAutoForgotPassword from "./pages/DebugAutoForgotPassword";
import TestAPI from "./pages/TestAPI"; // ✅ added import
import ReferPatient from "./pages/ReferPatient";
import About from "./pages/About";
import DepressionDetail from "./pages/DepressionDetail";
import AnxietyDetail from "./pages/AnxietyDetail";
import StressDetail from "./pages/StressDetail";
import VideoPlatform from "./pages/VideoPlatform";
import BookAppointment from "./pages/BookAppointment";
import PatientChat from "./pages/PatientChat";
import TestComponent from "./pages/TestComponent"; // Test component import
import Meditation from "./pages/Meditation";
import AdminMeditation from "./pages/AdminMeditation";
import { ThemeProvider } from "./context/ThemeContext";

function isAuthenticated() {
  try {
    // Check if we have a user in localStorage (API auth)
    const raw = localStorage.getItem("mm_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // If we have a user from API auth, consider authenticated
        if (parsed && (parsed.authSource === "api" || parsed.id || parsed.email)) {
          console.log("User authenticated via localStorage:", parsed);
          return true;
        }
      } catch (_) {
        // If parsing fails, continue to check Firebase auth
      }
    }
    
    // Check Firebase auth state
    // Note: auth.currentUser might be null during initialization
    // but we should still check it
    const firebaseAuth = !!auth.currentUser;
    console.log("Firebase auth state:", firebaseAuth);
    return firebaseAuth;
  } catch (error) {
    console.error("Error in isAuthenticated:", error);
    // Fallback to Firebase auth state
    return !!auth.currentUser;
  }
}

function RequireAuth({ children, allowedRoles = [] }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthorized: false,
    shouldRedirect: false,
    userType: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRaw = localStorage.getItem('mm_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const isAuthed = isAuthenticated();
        
        // If not authenticated, redirect to login
        if (!isAuthed) {
          console.log("User not authenticated, redirecting to login");
          setAuthState({
            isLoading: false,
            isAuthorized: false,
            shouldRedirect: true,
            userType: null
          });
          return;
        }

        // If no specific roles required, just check authentication
        if (allowedRoles.length === 0) {
          console.log("User authenticated, no role restrictions");
          setAuthState({
            isLoading: false,
            isAuthorized: true,
            shouldRedirect: false,
            userType: user?.userType || null
          });
          return;
        }

        // Check if user has required role
        if (user?.userType && allowedRoles.includes(user.userType)) {
          setAuthState({
            isLoading: false,
            isAuthorized: true,
            shouldRedirect: false,
            userType: user?.userType || null
          });
        } else {
          setAuthState({
            isLoading: false,
            isAuthorized: false,
            shouldRedirect: true,
            userType: user?.userType || null
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          isLoading: false,
          isAuthorized: false,
          shouldRedirect: true,
          userType: null
        });
      }
    };

    checkAuth();
  }, [allowedRoles.join(',')]); // Use stringified version to prevent infinite loop

  // Show loading state initially to prevent flickering
  if (authState.isLoading) {
    return null; // Or a loading spinner
  }

  if (authState.shouldRedirect) {
    // Redirect based on authentication status and user type
    if (!isAuthenticated()) {
      // Not authenticated at all, redirect to login
      return <Navigate to="/login" replace />;
    } else if (authState.userType === 'admin') {
      // Admin user trying to access non-admin route, redirect to admin dashboard
      return <Navigate to="/admin/dashboard" replace />;
    } else if (authState.userType === 'therapist') {
      // Therapist user, redirect to therapist dashboard
      return <Navigate to="/therapist-dashboard" replace />;
    } else {
      // Regular user, redirect to home
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

function PublicOnly({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthed: false,
    userType: null
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthed = isAuthenticated();
        
        if (isAuthed) {
          // Get user type to determine appropriate redirect
          const raw = localStorage.getItem("mm_user");
          if (raw) {
            try {
              const user = JSON.parse(raw);
              setAuthState({
                isLoading: false,
                isAuthed: true,
                userType: user?.userType || null
              });
            } catch (e) {
              console.error("Error parsing user data:", e);
              setAuthState({
                isLoading: false,
                isAuthed: true,
                userType: null
              });
            }
          } else {
            setAuthState({
              isLoading: false,
              isAuthed: true,
              userType: null
            });
          }
        } else {
          setAuthState({
            isLoading: false,
            isAuthed: false,
            userType: null
          });
        }
      } catch (error) {
        console.error("Error in authentication check:", error);
        setAuthState({
          isLoading: false,
          isAuthed: false,
          userType: null
        });
      }
    };

    checkAuth();
  }, []);

  // Show loading state initially to prevent flickering
  if (authState.isLoading) {
    return null; // Or a loading spinner
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (authState.isAuthed) {
    // Redirect based on user type
    if (authState.userType === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (authState.userType === 'therapist') {
      return <Navigate to="/therapist-dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
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
          path="/meditation"
          element={
            <RequireAuth>
              <PageTransition><Meditation /></PageTransition>
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
          path="/depression-detail"
          element={
            <RequireAuth>
              <PageTransition><DepressionDetail /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/anxiety-detail"
          element={
            <RequireAuth>
              <PageTransition><AnxietyDetail /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/stress-detail"
          element={
            <RequireAuth>
              <PageTransition><StressDetail /></PageTransition>
            </RequireAuth>
          }
        />
        
        {/* Video Platform Route */}
        <Route
          path="/video-platform"
          element={
            <RequireAuth>
              <PageTransition><VideoPlatform /></PageTransition>
            </RequireAuth>
          }
        />
        
        {/* ✅ Therapist Dashboard Route */}
        <Route
          path="/therapist-dashboard"
          element={
            <RequireAuth allowedRoles={['therapist']}>
              <PageTransition><TherapistDashboard /></PageTransition>
            </RequireAuth>
          }
        />
        
        {/* ✅ Therapist Calendar Route */}
        <Route
          path="/therapist-calendar"
          element={
            <RequireAuth allowedRoles={['therapist']}>
              <PageTransition><TherapistCalendar /></PageTransition>
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
        
        {/* ✅ Book Therapist Route */}
        <Route
          path="/therapists"
          element={
            <RequireAuth>
              <PageTransition><BookTherapist /></PageTransition>
            </RequireAuth>
          }
        />

        {/* ✅ Test Component Route */}
        <Route
          path="/test-component"
          element={
            <RequireAuth>
              <PageTransition><TestComponent /></PageTransition>
            </RequireAuth>
          }
        />

        {/* ✅ Book Appointment Routes */}
        <Route
          path="/appointments"
          element={
            <RequireAuth>
              <PageTransition><BookAppointment /></PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path="/book-appointment/:therapistId"
          element={
            <RequireAuth>
              <PageTransition><BookAppointment /></PageTransition>
            </RequireAuth>
          }
        />

        {/* ✅ Patient Chat Route */}
        <Route
          path="/patient-chat/:therapistId"
          element={
            <RequireAuth>
              <PageTransition><PatientChat /></PageTransition>
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
        <Route
          path="/admin/meditation"
          element={
            <RequireAdmin>
              <PageTransition><AdminMeditation /></PageTransition>
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
    <ThemeProvider>
      <BrowserRouter>
        <ThemeLayout>
          <AnimatedRoutes />
        </ThemeLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
