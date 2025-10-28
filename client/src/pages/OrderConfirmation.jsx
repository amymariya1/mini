import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatINR } from "../utils/currency";
import { getCart, clearCart } from "../services/api";
import { createOrder } from "../services/api"; // Import the new createOrder function

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // Get user ID and email from localStorage
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('mm_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user?.id) {
          setUserId(user.id);
        }
        if (user?.email) {
          setUserEmail(user.email);
        }
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  // Load cart and address on mount
  // Also clear the cart since order is confirmed
  useEffect(() => {
    async function loadCartAndAddress() {
      try {
        // Load cart from backend
        if (userId) {
          console.log('Loading cart in OrderConfirmation for user:', userId);
          const response = await getCart(userId);
          const cartData = response.cart?.items || [];
          setCart(cartData);
        } else {
          // Fallback to localStorage if no user ID
          const cartRaw = localStorage.getItem("mm_cart");
          console.log('Loading cart from localStorage in OrderConfirmation:', cartRaw);
          if (cartRaw) {
            const parsed = JSON.parse(cartRaw);
            if (Array.isArray(parsed)) setCart(parsed);
          }
        }
        
        // Load checkout address
        const addressRaw = localStorage.getItem("mm_checkout_address");
        if (addressRaw) {
          const parsed = JSON.parse(addressRaw);
          setAddress(parsed);
        }
        
        // Load payment method
        const paymentMethodRaw = localStorage.getItem("mm_payment_method");
        if (paymentMethodRaw) {
          setPaymentMethod(paymentMethodRaw);
        }
      } catch (error) {
        console.log('Error in OrderConfirmation useEffect:', error);
      }
    }
    
    loadCartAndAddress();
  }, [userId]);

  // Create order in database
  useEffect(() => {
    async function createOrderInDatabase() {
      // Only create order if we have all required data and haven't created one yet
      if (cart.length > 0 && userId && userEmail && address && !orderId) {
        try {
          console.log('Creating order with data:', { cart, userId, userEmail, address, paymentMethod });
          
          // Generate order ID
          const newOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          setOrderId(newOrderId);
          
          // Set dates
          const now = new Date();
          setOrderDate(now.toLocaleDateString());
          setDeliveryDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString());
          
          // Calculate totals
          const subtotal = cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
          const tax = subtotal * 0.18;
          const total = subtotal + tax;
          
          // Prepare order data
          const orderData = {
            orderId: newOrderId,
            userId,
            userEmail,
            items: cart.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity
            })),
            shippingAddress: address,
            paymentMethod,
            subtotal,
            tax,
            total,
            status: "confirmed"
          };
          
          console.log('Creating order with data:', orderData);
          
          // Save order to database using the new API function
          const result = await createOrder(orderData);
          console.log('Order creation result:', result);
          
          if (result.success) {
            console.log('Order created successfully:', result.order);
            // Redirect to orders page after successful order creation
            setTimeout(() => {
              navigate('/orders');
            }, 3000); // Redirect after 3 seconds
          } else {
            console.error('Failed to create order:', result.message);
          }
          
          // Clear cart since order is confirmed
          if (userId) {
            console.log('Clearing cart in OrderConfirmation for user:', userId);
            await clearCart(userId);
          } else {
            console.log('Clearing cart in OrderConfirmation from localStorage');
            localStorage.removeItem("mm_cart");
          }
          
          // Clear checkout data
          localStorage.removeItem("mm_checkout_address");
          localStorage.removeItem("mm_payment_method");
          localStorage.removeItem("mm_reopen_cart");
          
          // Send order confirmation email
          sendOrderConfirmationEmail(newOrderId);
        } catch (error) {
          console.error('Error creating order:', error);
        }
      } else if (!userId) {
        console.log('Not creating order - userId not available yet');
      } else if (!userEmail) {
        console.log('Not creating order - userEmail not available yet');
      } else if (cart.length === 0) {
        console.log('Not creating order - cart is empty');
      } else if (!address) {
        console.log('Not creating order - address not available');
      } else if (orderId) {
        console.log('Not creating order - order already created');
      }
    }
    
    createOrderInDatabase();
  }, [cart, userId, userEmail, address, paymentMethod, orderId, navigate]);

  // Calculate cart totals
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  // Send order confirmation email
  const sendOrderConfirmationEmail = async (orderRef) => {
    try {
      // Prepare order details for the email
      const orderDetails = {
        orderId: orderRef || orderId,
        orderDate: orderDate || new Date().toLocaleDateString(),
        deliveryDate: deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: formatINR(item.price),
          total: formatINR(item.price * item.quantity)
        })),
        subtotal: formatINR(getTotalPrice()),
        shipping: "FREE",
        tax: formatINR(getTotalPrice() * 0.18),
        total: formatINR(getTotalPrice() * 1.18),
        deliveryAddress: address
      };

      // Send email via backend API
      const response = await fetch('http://localhost:5002/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          orderDetails
        })
      });

      if (response.ok) {
        console.log('Order confirmation email sent successfully');
      } else {
        console.error('Failed to send order confirmation email');
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px", textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'white',
            fontSize: '36px'
          }}>
            ✓
          </div>
        </motion.div>
        
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Order Confirmed!</h1>
        <p className="subtle" style={{ fontSize: '18px', marginBottom: '32px' }}>
          Thank you for your purchase. Your order has been received.
        </p>
        
        <div style={{ 
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0 }}>Order Details</h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>#{orderId}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{orderDate || new Date().toLocaleDateString()}</p>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Order Date</p>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Order ID:</span>
              <strong>{orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Delivery:</span>
              <strong>{deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment Method:</span>
              <strong>{paymentMethod}</strong>
            </div>
          </div>
          
          {address && (
            <div>
              <h3 style={{ marginBottom: '12px' }}>Delivery Address</h3>
              <div style={{ 
                padding: '16px', 
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>{address.fullName}</p>
                <p style={{ margin: '0 0 4px 0' }}>{address.addressLine1}</p>
                {address.addressLine2 && <p style={{ margin: '0 0 4px 0' }}>{address.addressLine2}</p>}
                <p style={{ margin: '0 0 4px 0' }}>{address.city}, {address.state} {address.postalCode}</p>
                <p style={{ margin: '0' }}>Phone: {address.phone}</p>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Order Summary</h3>
            <div style={{ 
              display: 'grid',
              gap: '12px'
            }}>
              {cart.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: index < cart.length - 1 ? '1px solid #e2e8f0' : 'none'
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0' }}>{formatINR(item.price * item.quantity)}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{formatINR(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              borderTop: '1px solid #e2e8f0',
              marginTop: '16px',
              paddingTop: '16px'
            }}>
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
                borderTop: '1px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '18px'
              }}>
                <span>Total</span>
                <span>{formatINR(getTotalPrice() * 1.18)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          className="cta-btn"
          onClick={() => navigate('/orders')}
          style={{ 
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          View Order History
        </button>
      </motion.div>
    </div>
  );
}