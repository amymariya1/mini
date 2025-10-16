import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register as apiRegister } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", age: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Function to validate password strength
  function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirmPassword || form.age === "") {
      setError("Please fill in all fields.");
      return;
    }
    
    // Validate password strength
    if (!validatePassword(form.password)) {
      setError("Password must contain at least 8 characters including uppercase, lowercase, number, and special character.");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const ageNum = Number(form.age);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError("Please enter a valid age.");
      return;
    }
    try {
      setLoading(true);
      await apiRegister({ name: form.name, email: form.email, password: form.password, age: ageNum });
      navigate("/login");
    } catch (err) {
      // Handle specific error for duplicate email
      if (err.message === "Email already registered") {
        setError("Email already exists. Please use a different email or log in instead.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ maxWidth: 480, margin: "64px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 16 }}>Create your account</h2>
      <p className="subtle" style={{ marginBottom: 24 }}>Start your journey with MindMirror</p>

      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "10px 12px",
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #fecaca"
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Full name</div>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="input"
          />
        </label>

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
          <div style={{ fontSize: 14, marginBottom: 6 }}>Age</div>
          <input
            type="number"
            name="age"
            min={0}
            max={150}
            value={form.age}
            onChange={handleChange}
            placeholder="18"
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

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Confirm password</div>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="input"
          />
        </label>

        <button disabled={loading} type="submit" className="cta-btn" style={{ width: "100%", marginTop: 6, color: "black" }}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to="/login">Sign in</Link> or <Link to="/forgot-password">Forgot password?</Link>
      </div>
      
      {/* Therapist registration option */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button 
          type="button" 
          onClick={() => navigate("/therapist-register")}
          className="btn btn-secondary"
          style={{ padding: "10px 20px" }}
        >
          Register as Therapist
        </button>
      </div>
    </motion.div>
  );
}