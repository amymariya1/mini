import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { login as apiLogin, adminLogin as apiAdminLogin } from "../services/api";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup, onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // 🔹 MAIN LOGIN HANDLER
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Try ADMIN LOGIN
      try {
        console.log('Attempting admin login with email:', form.email);
        const adminData = await apiAdminLogin({ email: form.email, password: form.password });
        console.log('Admin login successful:', adminData);
        if (adminData?.token) localStorage.setItem("mm_admin_token", adminData.token);
        if (adminData?.admin) localStorage.setItem("mm_admin", JSON.stringify(adminData.admin));
        navigate("/admin/dashboard");
        return;
      } catch (adminError) {
        console.log('Admin login failed:', adminError.message);
        // If it's specifically a 401 error, it means invalid credentials, so we should try user login
        // For other errors, we might want to show them
        if (adminError.message !== 'Invalid credentials') {
          console.log('Admin login failed with error:', adminError.message);
        }
        // Continue to user login
      }

      // 2️⃣ USER / THERAPIST LOGIN
      console.log('Attempting user login with email:', form.email);
      const response = await apiLogin(form);
      console.log('User login successful:', response);
      
      // Check if this is a success response with user data
      if (response?.user) {
        // If therapist and not approved, block login and show message
        if (response.user?.userType === "therapist" && response.user?.isApproved === false) {
          setError("Your therapist account is pending admin approval. Please try again later.");
          return;
        }

        const sessionUser = { ...response.user, authSource: "api" };
        localStorage.setItem("mm_user", JSON.stringify(sessionUser));

        // 🔸 ROUTE BASED ON TYPE OR AGE
        if (response.user?.userType === "therapist") {
          navigate("/therapist-dashboard");
        } else if (typeof response.user?.age === "number" && response.user.age < 18) {
          navigate("/home-teen");
        } else {
          navigate("/home");
        }
        return;
      }
      
      // Check if this is an error response
      if (response?.message) {
        throw new Error(response.message);
      }
      
      // If we get here, it's an unexpected response
      throw new Error("Login failed - unexpected response format");
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 GOOGLE SIGN-IN
  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      let age, userType;
      try {
        const tokenResult = await getIdTokenResult(fbUser, true);
        age = tokenResult?.claims?.age;
        userType = tokenResult?.claims?.userType;
      } catch (_) {}

      const user = {
        id: fbUser.uid,
        name: fbUser.displayName || "",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        age,
        userType,
        authSource: "firebase",
      };

      localStorage.setItem("mm_user", JSON.stringify(user));

      // 🔸 ROUTING LOGIC
      if (userType === "therapist") {
        navigate("/therapist-dashboard");
      } else if (typeof age === "number" && age < 18) {
        navigate("/home-teen");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  // 🔹 AUTH STATE MONITOR (Firebase)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const cached = localStorage.getItem("mm_user");
        if (!cached) {
          const user = {
            id: u.uid,
            name: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || undefined,
          };
          localStorage.setItem("mm_user", JSON.stringify(user));
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: 480, margin: "64px auto", padding: "0 16px" }}
    >
      <h2 style={{ marginBottom: 16 }}>Welcome back</h2>
      <p className="subtle" style={{ marginBottom: 24 }}>
        Sign in to continue your journey
      </p>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 16,
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Email</div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input"
          />
        </label>

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Password</div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input"
          />
        </label>

        <button
          disabled={loading}
          type="submit"
          className="cta-btn"
          style={{ width: "100%", marginTop: 6, color: "black" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div style={{ textAlign: "right", marginTop: 8 }}>
        <Link to="/forgot-password" style={{ fontSize: 14, color: "#6b7280" }}>
          Forgot password?
        </Link>
      </div>

      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        className="oauth-btn"
        style={{ width: "100%", marginTop: 12 }}
      >
        {googleLoading ? (
          "Connecting to Google..."
        ) : (
          <>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083h-1.611V20H24v8h11.303c-1.648 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.643 6.053 29.047 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.643 6.053 29.047 4 24 4c-7.798 0-14.426 4.417-17.694 10.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.17 0 9.86-1.977 13.409-5.197l-6.2-5.238C29.136 35.091 26.715 36 24 36c-5.202 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.424 39.556 16.162 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083h-1.611V20H24v8h11.303a12.01 12.01 0 01-4.094 5.565l6.2 5.238C39.202 40.2 44 32 44 24c0-1.341-.138-2.651-.389-3.917z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        Don't have an account? <Link to="/register">Create one</Link> or <Link to="/therapist-register">Register as Therapist</Link>
      </div>
    </motion.div>
  );
}