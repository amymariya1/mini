import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { formatINR } from "../utils/currency";

// Mock order data - in a real app this would come from an API
const mockOrders = [
  {
    id: "ORD-001",
    date: "2023-06-15",
    status: "Delivered",
    total: 2499,
    items: [
      {
        id: "1",
        name: "Meditation Cushion",
        price: 1299,
        quantity: 1,
        image: "🧘"
      },
      {
        id: "2",
        name: "Aromatherapy Diffuser",
        price: 1199,
        quantity: 1,
        image: "🕯️"
      }
    ]
  },
  {
    id: "ORD-002",
    date: "2023-05-22",
    status: "Shipped",
    total: 899,
    items: [
      {
        id: "3",
        name: "Sleep Mask",
        price: 899,
        quantity: 1,
        image: "😴"
      }
    ]
  }
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "#10b981";
      case "Shipped": return "#3b82f6";
      case "Processing": return "#f59e0b";
      default: return "#6b7280";
    }
  };

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
                key={order.id}
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
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      {new Date(order.date).toLocaleDateString()}
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
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item" style={{
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
                        {item.image}
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
                      onClick={() => alert(`Viewing details for order ${order.id}`)}
                      style={{ marginRight: '8px' }}
                    >
                      View Details
                    </button>
                    <button 
                      className="cta-btn"
                      onClick={() => alert(`Reordering items from order ${order.id}`)}
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