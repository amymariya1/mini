import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { formatINR } from "../utils/currency";
import { fetchUserOrders as getUserOrders } from "../services/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

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
      console.error('Error getting user data:', error);
    }
  }, []);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await getUserOrders(userId);
        if (response.success) {
          setOrders(response.orders);
        } else {
          setError(response.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": 
      case "delivered": 
        return "#10b981";
      case "Shipped": 
      case "shipped": 
        return "#3b82f6";
      case "Processing": 
      case "processing": 
        return "#f59e0b";
      case "Confirmed": 
      case "confirmed": 
        return "#2196f3";
      case "Pending": 
      case "pending": 
        return "#ff9800";
      case "Cancelled": 
      case "cancelled": 
        return "#f44336";
      default: 
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="shopping-page">
        <Navbar />
        <div className="shopping-container">
          <div className="loading-container">
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-page">
        <Navbar />
        <div className="shopping-container">
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="cta-btn" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-page">
      <Navbar />
      
      {/* Header */}
      <header className="shopping-header">
        <div className="shopping-container">
          <motion.div
            className="shopping-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>My Orders</h1>
            <p>View your order history and track deliveries</p>
          </motion.div>
        </div>
      </header>

      <div className="shopping-container">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>You haven't placed any orders yet</h3>
            <p>Start shopping to see your order history</p>
            <Link to="/shopping" className="cta-btn" style={{ display: 'inline-block', marginTop: '16px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                className="order-card"
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="order-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Order #{order.orderId}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#fff',
                      background: getStatusColor(order.status)
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item._id || item.productId} className="order-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f5f5f5'
                    }}>
                      <div className="item-image" style={{
                        width: '50px',
                        height: '50px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        fontSize: '24px'
                      }}>
                        {item.image || '📦'}
                      </div>
                      <div className="item-details" style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>{item.name}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                          Qty: {item.quantity} × {formatINR(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #eee'
                }}>
                  <div>
                    <strong>Total: {formatINR(order.total)}</strong>
                  </div>
                  <div>
                    <button 
                      className="secondary-btn"
                      onClick={() => navigate(`/orders/${order._id}`)}
                      style={{ marginRight: '8px' }}
                    >
                      View Details
                    </button>
                    <button 
                      className="cta-btn"
                      onClick={() => alert(`Reordering items from order ${order.orderId}`)}
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}