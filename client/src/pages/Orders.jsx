import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatINR } from "../utils/currency";
import { fetchUserOrders as getUserOrders } from "../services/api";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const statusColors = {
    pending: '#ff9800',
    confirmed: '#2196f3',
    processing: '#9c27b0',
    shipped: '#ff5722',
    delivered: '#4caf50',
    cancelled: '#f44336'
  };

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

  // Fetch user orders when userId changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        console.log('No userId available, cannot fetch orders');
        return;
      }
      
      console.log('Fetching orders for userId:', userId);
      
      setLoading(true);
      setError(null);
      try {
        const response = await getUserOrders(userId);
        console.log('Orders response:', response);
        if (response.success) {
          setOrders(response.orders);
          console.log('Successfully fetched orders:', response.orders);
        } else {
          setError(response.message || 'Failed to fetch orders');
          console.error('Failed to fetch orders:', response.message);
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

  // Add a refresh function to manually refresh orders
  const refreshOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await getUserOrders(userId);
      if (response.success) {
        setOrders(response.orders);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders when component mounts to ensure latest data
  useEffect(() => {
    if (userId) {
      refreshOrders();
    }
  }, [userId]);

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format status history for display
  const formatStatusHistory = (statusHistory) => {
    if (!statusHistory || statusHistory.length === 0) return "Order created";
    
    const latestUpdate = statusHistory[statusHistory.length - 1];
    const timestamp = new Date(latestUpdate.timestamp).toLocaleString();
    return `${getStatusLabel(latestUpdate.status)} - ${timestamp}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="cta-btn"
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0 }}>My Orders</h1>
            <p className="subtle">View and track your order history</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="cta-btn secondary"
              onClick={refreshOrders}
              style={{ color: "black" }}
            >
              Refresh
            </button>
            <button 
              className="cta-btn"
              onClick={() => navigate('/shopping')}
              style={{ color: "black" }}
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>You haven't placed any orders yet</h3>
            <p>When you make a purchase, your orders will appear here.</p>
            <button 
              className="cta-btn"
              onClick={() => navigate('/shopping')}
              style={{ marginTop: '20px', color: "black" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div>
            {orders.map(order => (
              <div 
                key={order._id} 
                className="card"
                style={{ 
                  marginBottom: '20px',
                  borderLeft: `4px solid ${statusColors[order.status] || '#9e9e9e'}`,
                  position: 'relative'
                }}
              >
                {/* Status indicator badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: statusColors[order.status] || '#9e9e9e',
                  color: 'white',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8em',
                  fontWeight: '600'
                }}>
                  {getStatusLabel(order.status)}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Order #{order.orderId}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold' }}>
                      {formatINR(order.total)}
                    </p>
                  </div>
                </div>
                
                {/* Status history */}
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '0.9em'
                }}>
                  <strong>Last Update:</strong> {formatStatusHistory(order.statusHistory)}
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px'
                      }}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9em' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f9f9f9',
                      borderRadius: '4px'
                    }}>
                      <p style={{ margin: 0, color: '#666' }}>
                        +{order.items.length - 3} more items
                      </p>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link 
                    to={`/orders/${order._id}`}
                    className="secondary-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}