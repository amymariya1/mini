import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatINR } from "../utils/currency";
import { getCart } from "../services/api";
import { displayRazorpay } from "../utils/razorpay";

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [form, setForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upiId: ""
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

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

  // Load cart and address on mount
  useEffect(() => {
    async function loadCartAndAddress() {
      // Load cart from backend
      if (userId) {
        try {
          console.log('Loading cart in CheckoutPayment for user:', userId);
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
      
      // Load checkout address
      try {
        const addressRaw = localStorage.getItem("mm_checkout_address");
        if (addressRaw) {
          const parsed = JSON.parse(addressRaw);
          setAddress(parsed);
        }
      } catch (error) {
        console.log('Error loading address in CheckoutPayment:', error);
      }
    }
    
    loadCartAndAddress();
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
    if (paymentMethod === "card") {
      // For Razorpay, we don't need form validation
      return "";
    } else if (paymentMethod === "upi") {
      if (!form.upiId.trim()) return "UPI ID is required";
    }
    return "";
  }

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    console.log('handleRazorpayPayment called');
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    const totalAmount = Math.round(total * 100); // Convert to paise
    console.log('Payment details:', { subtotal, tax, total, totalAmount });
    
    const paymentSuccess = (response) => {
      console.log("Payment successful:", response);
      // Save payment method
      localStorage.setItem("mm_payment_method", "Credit Card");
      // Clear checkout data but keep cart until confirmation
      localStorage.removeItem("mm_checkout_address");
      localStorage.removeItem("mm_reopen_cart");
      // Navigate to order confirmation
      navigate("/checkout/confirmation");
    };
    
    const paymentFailure = (response) => {
      console.log("Payment failed:", response);
      setError("Payment failed. Please try again.");
      setProcessing(false);
    };
    
    try {
      await displayRazorpay(
        totalAmount, // Already in paise
        address?.fullName || "Customer",
        "customer@example.com",
        address?.phone || "9999999999",
        paymentSuccess,
        paymentFailure
      );
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Payment processing failed. Please try again.");
      setProcessing(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // If using Razorpay for card payments, we handle it separately with the dedicated button
    if (paymentMethod === "card") {
      // Do nothing here, let the dedicated Razorpay button handle it
      return;
    }
    
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setProcessing(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save payment method
      localStorage.setItem("mm_payment_method", paymentMethod === "upi" ? "UPI" : "Cash on Delivery");
      
      // Only clear checkout address and reopen flag, keep cart until confirmation
      console.log('Payment processed, clearing checkout data but keeping cart');
      localStorage.removeItem("mm_checkout_address");
      localStorage.removeItem("mm_reopen_cart");
      
      // Navigate to order confirmation
      navigate("/checkout/confirmation");
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
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
        <p className="subtle" style={{ marginBottom: 24 }}>Complete your payment</p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Left Column - Payment Methods */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ 
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Payment Method</h3>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px',
                  border: paymentMethod === 'card' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'card' ? '#eff6ff' : '#fff'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    style={{ marginRight: '12px' }}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>Credit/Debit Card</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      Pay with Visa, Mastercard, or Rupay via Razorpay
                    </p>
                  </div>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px',
                  border: paymentMethod === 'upi' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'upi' ? '#eff6ff' : '#fff'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    style={{ marginRight: '12px' }}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>UPI</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      Pay with any UPI app
                    </p>
                  </div>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px',
                  border: paymentMethod === 'cod' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'cod' ? '#eff6ff' : '#fff'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ marginRight: '12px' }}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>Cash on Delivery</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Payment Form */}
            <div style={{ 
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>
                {paymentMethod === 'card' && 'Secure Payment with Razorpay'}
                {paymentMethod === 'upi' && 'UPI Details'}
                {paymentMethod === 'cod' && 'Cash on Delivery'}
              </h3>
              
              {paymentMethod === 'card' && (
                <div>
                  <div style={{ 
                    padding: '20px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Secure Payment with Razorpay</h4>
                    <p style={{ margin: 0, color: '#64748b' }}>
                      Your payment will be processed securely through Razorpay. You'll be redirected to a secure payment page.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="cta-btn" 
                    onClick={handleRazorpayPayment}
                    disabled={processing}
                    style={{ color: "black", width: "100%" }}
                  >
                    {processing ? "Processing Payment..." : `Pay ${formatINR(getTotalPrice() * 1.18)} with Razorpay`}
                  </button>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                  <label>
                    <div style={{ fontSize: 14, marginBottom: 6 }}>UPI ID</div>
                    <input
                      className="input"
                      type="text"
                      name="upiId"
                      value={form.upiId}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Enter your UPI ID (e.g., mobile number or VPA)
                    </p>
                  </label>
                  <button 
                    type="submit" 
                    className="cta-btn" 
                    disabled={processing}
                    style={{ color: "black", width: "100%" }}
                  >
                    {processing ? "Processing Payment..." : `Pay ${formatINR(getTotalPrice() * 1.18)}`}
                  </button>
                </form>
              )}
              
              {paymentMethod === 'cod' && (
                <div>
                  <div style={{ 
                    padding: '20px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Cash on Delivery</h4>
                    <p style={{ margin: 0, color: '#64748b' }}>
                      You can pay in cash at the time of delivery. Please ensure you have exact change.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="cta-btn" 
                    onClick={handleSubmit}
                    disabled={processing}
                    style={{ color: "black", width: "100%" }}
                  >
                    {processing ? "Processing..." : `Confirm Order - ${formatINR(getTotalPrice() * 1.18)}`}
                  </button>
                </div>
              )}
            </div>
            
            {error && (
              <div style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: 8,
                marginTop: 16,
                border: "1px solid #fecaca"
              }}>{error}</div>
            )}
            
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="oauth-btn"
                onClick={() => navigate('/checkout/address')}
              >
                ← Back to Address
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{ 
            flex: 1, 
            minWidth: 300
          }}>
            {/* Delivery Address */}
            {address && (
              <div style={{ 
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginTop: 0 }}>Delivery Address</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{address.fullName}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}, 
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Phone: {address.phone}
                  </p>
                </div>
                <button 
                  className="secondary-btn"
                  onClick={() => navigate('/checkout/address')}
                  style={{ marginTop: '12px', padding: '6px 12px' }}
                >
                  Change Address
                </button>
              </div>
            )}
            
            {/* Order Summary */}
            <div style={{ 
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Order Summary</h3>
              
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
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}