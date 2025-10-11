import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill from saved address if exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_checkout_address");
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((f) => ({ ...f, ...saved }));
      }
    } catch (_) {}
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.addressLine1.trim()) return "Address Line 1 is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    if (!form.postalCode.trim()) return "Postal code is required";
    return "";
    }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setSaving(true);
      localStorage.setItem("mm_checkout_address", JSON.stringify(form));
      // Navigate to next step (if exists). For now, return to shopping or keep here.
      navigate("/shopping", { replace: true });
    } catch (err) {
      setError("Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 680, margin: "32px auto", padding: "0 16px" }}
      >
        <h2 style={{ marginBottom: 8 }}>Shipping Address</h2>
        <p className="subtle" style={{ marginBottom: 16 }}>Please provide your delivery details.</p>

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
            <div style={{ fontSize: 14, marginBottom: 6 }}>Full Name</div>
            <input
              className="input"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </label>

          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Phone</div>
            <input
              className="input"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
          </label>

          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Address Line 1</div>
            <input
              className="input"
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="House no, Street"
            />
          </label>

          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Address Line 2</div>
            <input
              className="input"
              type="text"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Area, Landmark"
            />
          </label>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)" }}>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>City</div>
              <input
                className="input"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
            </label>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>State</div>
              <input
                className="input"
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
            </label>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)" }}>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Postal Code</div>
              <input
                className="input"
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="400001"
              />
            </label>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Country</div>
              <input
                className="input"
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="India"
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="oauth-btn"
              onClick={() => {
                // Go back to shopping and reopen the cart
                localStorage.setItem('mm_reopen_cart', '1');
                navigate('/shopping');
              }}
            >
              Back
            </button>
            <button type="submit" className="cta-btn" disabled={saving} style={{ color: "black" }}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}