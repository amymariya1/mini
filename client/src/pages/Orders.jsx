import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatINR } from "../utils/currency";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5002/api/user-orders/${userId}`);
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0 }}>My Orders</h1>
            <p className="subtle">View and track your order history</p>
          </div>
          <button 
            className="cta-btn"
            onClick={() => navigate('/shopping')}
            style={{ color: "black" }}
          >
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
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
                  borderLeft: `4px solid ${statusColors[order.status] || '#9e9e9e'}`
                }}
              >
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
                    <p style={{ margin: '5px 0 0 0' }}>
                      <span style={{
                        backgroundColor: statusColors[order.status] || '#9e9e9e',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8em'
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </p>
                  </div>
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
                  <button 
                    className="secondary-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div 
            className="modal-backdrop"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="modal" 
              style={{ maxWidth: '600px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0 }}>Order Details</h2>
                <button 
                  className="cta-btn secondary"
                  onClick={() => setSelectedOrder(null)}
                  style={{ padding: '5px 10px' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Order #{selectedOrder.orderId}</h3>
                <p>Placed on {formatDate(selectedOrder.createdAt)}</p>
                <p>Status: 
                  <span style={{
                    backgroundColor: statusColors[selectedOrder.status] || '#9e9e9e',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8em',
                    marginLeft: '10px'
                  }}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4>Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
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
                          <span style={{ fontSize: '0.8em' }}>📦</span>
                        )}
                      </div>
                      <div>
                        <p style={{ margin: 0 }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{formatINR(item.price * item.quantity)}</p>
                      <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                        {formatINR(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: '1px solid #eee',
                paddingTop: '15px'
              }}>
                <div>
                  <p>Subtotal</p>
                  <p>Shipping</p>
                  <p>Tax</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p>{formatINR(selectedOrder.subtotal)}</p>
                  <p>FREE</p>
                  <p>{formatINR(selectedOrder.tax)}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{formatINR(selectedOrder.total)}</p>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h4>Shipping Address</h4>
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '15px', 
                  borderRadius: '4px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    {selectedOrder.shippingAddress.addressLine1}
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <>, {selectedOrder.shippingAddress.addressLine2}</>
                    )}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p style={{ margin: '5px 0 0 0' }}>
                    Phone: {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>
              
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 1 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Status History</h4>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {[...selectedOrder.statusHistory].reverse().map((history, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '10px',
                          background: '#f9f9f9',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: statusColors[history.status] || '#9e9e9e',
                          marginRight: '10px'
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 'bold' }}>
                            {getStatusLabel(history.status)}
                          </p>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                            {formatDate(history.timestamp)} at {new Date(history.timestamp).toLocaleTimeString()}
                          </p>
                          {history.note && (
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>
                              "{history.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}