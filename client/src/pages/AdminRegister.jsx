// client/src/pages/AdminRegister.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminRegister = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/admin/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      setSuccess("Admin registered successfully!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      console.log(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: 20 }}>
      <h2>Admin Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required/>
        <input name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" required/>
        <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" type="password" required/>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
    </div>
  );
};

export default AdminRegister;
