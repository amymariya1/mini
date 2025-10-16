import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatINR } from "../utils/currency";
import { getCart } from "../services/api";

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);
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

  // Get user ID from localStorage
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('mm_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user?.id) {
          setUserId(user.id);
        }
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  }, []);

  // Load cart and addresses on mount
  useEffect(() => {
    async function loadCartAndAddresses() {
      // Load cart from backend
      if (userId) {
        try {
          console.log('Loading cart in CheckoutAddress for user:', userId);
          const response = await getCart(userId);
          const cartData = response.cart?.items || [];
          setCart(cartData);
        } catch (error) {
          console.error('Error loading cart from backend:', error);
          // Fallback to localStorage
          try {
            const cartRaw = localStorage.getItem("mm_cart");
            console.log('Loading cart from localStorage as fallback:', cartRaw);
            if (cartRaw) {
              const parsed = JSON.parse(cartRaw);
              if (Array.isArray(parsed)) setCart(parsed);
            }
          } catch (localStorageError) {
            console.log('Error loading cart from localStorage:', localStorageError);
          }
        }
      } else {
        // Fallback to localStorage if no user ID
        try {
          const cartRaw = localStorage.getItem("mm_cart");
          console.log('Loading cart from localStorage (no user ID):', cartRaw);
          if (cartRaw) {
            const parsed = JSON.parse(cartRaw);
            if (Array.isArray(parsed)) setCart(parsed);
          }
        } catch (error) {
          console.log('Error loading cart from localStorage:', error);
        }
      }
      
      // Load saved addresses
      try {
        const addressesRaw = localStorage.getItem("mm_saved_addresses");
        if (addressesRaw) {
          const parsed = JSON.parse(addressesRaw);
          if (Array.isArray(parsed)) setAddresses(parsed);
        }
        
        // Load current checkout address
        const raw = localStorage.getItem("mm_checkout_address");
        if (raw) {
          const saved = JSON.parse(raw);
          setForm((f) => ({ ...f, ...saved }));
          // If this is an existing address, select it
          if (saved.id) {
            setSelectedAddressId(saved.id);
          }
        }
      } catch (error) {
        console.log('Error loading addresses in CheckoutAddress:', error);
      }
    }
    
    loadCartAndAddresses();
  }, [userId]);

  // Calculate cart totals
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

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

  // Save new address
  const saveNewAddress = () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    
    try {
      const newAddress = {
        ...form,
        id: Date.now().toString() // Simple ID generation
      };
      
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      localStorage.setItem("mm_saved_addresses", JSON.stringify(updatedAddresses));
      
      // Select this address
      setSelectedAddressId(newAddress.id);
      setForm(newAddress);
      
      // Hide form
      setShowNewAddressForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save address");
    }
  };

  // Select an existing address
  const selectAddress = (address) => {
    setSelectedAddressId(address.id);
    setForm(address);
    setShowNewAddressForm(false);
  };

  // Delete an address
  const deleteAddress = (addressId) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    setAddresses(updatedAddresses);
    localStorage.setItem("mm_saved_addresses", JSON.stringify(updatedAddresses));
    
    // If we deleted the selected address, clear selection
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setForm({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      });
    }
  };

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
      // Navigate to next step (payment)
      navigate("/checkout/payment");
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
        style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}
      >
        <h2 style={{ marginBottom: 8 }}>Checkout</h2>
        <p className="subtle" style={{ marginBottom: 24 }}>Select delivery address</p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Left Column - Address Selection */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3>Select Delivery Address</h3>
              <button 
                className="secondary-btn"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                style={{ padding: '8px 16px' }}
              >
                {showNewAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showNewAddressForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <h4 style={{ marginTop: 0 }}>Add New Address</h4>
                <form style={{ display: "grid", gap: 12 }}>
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
                      className="secondary-btn"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="cta-btn" 
                      onClick={saveNewAddress}
                      style={{ color: "black" }}
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {addresses.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4>Saved Addresses</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {addresses.map((address) => (
                    <div 
                      key={address.id}
                      style={{
                        border: selectedAddressId === address.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        background: selectedAddressId === address.id ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => selectAddress(address)}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {selectedAddressId === address.id && (
                          <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            Selected
                          </span>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(address.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <h4 style={{ margin: '0 0 8px 0' }}>{address.fullName}</h4>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}, 
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        Phone: {address.phone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showNewAddressForm && addresses.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1'
              }}>
                <p>No saved addresses yet</p>
                <button 
                  className="secondary-btn"
                  onClick={() => setShowNewAddressForm(true)}
                  style={{ marginTop: '12px' }}
                >
                  Add Your First Address
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="oauth-btn"
                  onClick={() => {
                    // Go back to shopping - cart should remain as is
                    navigate('/shopping');
                  }}
                >
                  ← Back to Cart
                </button>
                <button 
                  type="submit" 
                  className="cta-btn" 
                  disabled={saving || !selectedAddressId}
                  style={{ color: "black" }}
                >
                  {saving ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{ 
            flex: 1, 
            minWidth: 300,
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            maxHeight: 'fit-content'
          }}>
            <h3>Order Summary</h3>
            
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              marginBottom: '16px'
            }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: '#e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '20px'
                  }}>
                    {typeof item.image === 'string' && item.image.trim().length > 0 ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>{item.name}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                      Qty: {item.quantity} × {formatINR(item.price)}
                    </p>
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal</span>
                <span>{formatINR(getTotalPrice())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Tax</span>
                <span>{formatINR(getTotalPrice() * 0.18)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '2px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '18px'
              }}>
                <span>Total</span>
                <span>{formatINR(getTotalPrice() * 1.18)}</span>
              </div>
              
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
                <p style={{ margin: '4px 0' }}>✓ Free shipping on orders over ₹500</p>
                <p style={{ margin: '4px 0' }}>✓ 7-day return policy</p>
                <p style={{ margin: '4px 0' }}>✓ Secure payment</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}