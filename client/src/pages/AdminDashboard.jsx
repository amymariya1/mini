import React, { useState, useEffect } from "react";
import {
  adminListUsers,
  adminListProducts,
  adminListPosts,
  adminListQuestions,
  adminListPendingTherapists,
  adminApproveTherapist,
  adminLogout,
  adminToggleUserStatus,
  adminDeleteProduct,
  adminDeletePost,
  adminDeleteQuestion,
  adminCreateProduct,
  adminUpdateProductStock,
  createTherapist,
} from "../services/api";
import "../styles/AdminDashboard.css";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/orders');
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update order in state
        setOrders(orders.map(order => 
          order._id === selectedOrder._id ? data.order : order
        ));
        
        // Close modal and reset
        setStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setStatusNote('');
        
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <h3>Order Management</h3>
      <p>Manage and track all customer orders</p>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h4>No orders found</h4>
          <p>There are no orders to display yet.</p>
        </div>
      ) : (
        <div className="product-grid">
          {orders.map(order => (
            <div key={order._id} className="user-card" style={{ 
              borderLeft: `4px solid ${statusColors[order.status] || '#9e9e9e'}`
            }}>
              <div>
                <h4>Order #{order.orderId}</h4>
                <p><strong>Customer:</strong> {order.userEmail}</p>
                <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> 
                  <span style={{
                    backgroundColor: statusColors[order.status] || '#9e9e9e',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8em'
                  }}>
                    {getStatusLabel(order.status)}
                  </span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  className="cta-btn"
                  onClick={() => {
                    setSelectedOrder(order);
                    setStatusModal(true);
                    setNewStatus(order.status);
                  }}
                >
                  Update Status
                </button>
                <button 
                  className="cta-btn secondary"
                  onClick={() => {
                    setSelectedOrder(order);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <h3>Update Order Status</h3>
            <p><strong>Order #{selectedOrder.orderId}</strong></p>
            
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>New Status</label>
              <select 
                className="input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Note (Optional)</label>
              <textarea 
                className="input"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status update..."
                rows="3"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="cta-btn"
                onClick={handleStatusUpdate}
              >
                Update Status
              </button>
              <button 
                className="cta-btn secondary"
                onClick={() => {
                  setStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                  setStatusNote('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === ICONS ===
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const PostsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const QuestionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TherapistsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    <circle cx="16" cy="16" r="2"></circle>
    <path d="M20 16h-4"></path>
    <path d="M18 14v4"></path>
  </svg>
);

const PendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CATEGORY_OPTIONS = ["Wellness", "Equipment", "Books", "Supplements", "Courses", "Other"];
const NAV_ITEMS = [
  { id: "users", label: "Users", icon: <UsersIcon /> },
  { id: "therapists", label: "Therapists", icon: <TherapistsIcon /> },
  { id: "pending-therapists", label: "Pending Therapists", icon: <PendingIcon /> },
  { id: "products", label: "Products", icon: <ProductsIcon /> },
  { id: "orders", label: "Orders", icon: <ProductsIcon /> },
  { id: "posts", label: "Posts", icon: <PostsIcon /> },
  { id: "questions", label: "Questions", icon: <QuestionsIcon /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalProducts: 0, totalPosts: 0 });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showRestockSuggestions, setShowRestockSuggestions] = useState(false);

  const [therapistName, setTherapistName] = useState("");
  const [therapistEmail, setTherapistEmail] = useState("");
  const [therapistPassword, setTherapistPassword] = useState("");
  const [therapistAge, setTherapistAge] = useState("");
  const [therapistLicense, setTherapistLicense] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await adminListUsers();
      const usersData = data.users || [];
      setUsers(usersData.filter(u => u.userType !== "therapist"));
      setTherapists(usersData.filter(u => u.userType === "therapist" && u.isApproved));
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.filter(u => u.userType !== "therapist").length,
        activeUsers: usersData.filter(u => u.userType !== "therapist" && u.isActive).length
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPendingTherapists() {
    setLoading(true);
    try {
      const data = await adminListPendingTherapists();
      if (data.success) {
        setPendingTherapists(data.therapists || []);
      } else {
        setError(data.message || "Failed to load pending therapists");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await adminListProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await adminListPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await adminListQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleUserStatus(id, newStatus) {
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this user?`)) return;
    try {
      const response = await adminToggleUserStatus(id);
      if (response?.user) {
        setUsers(users.map(u => (u._id === id ? { ...u, isActive: response.user.isActive } : u)));
      }
    } catch (err) {
      alert("Failed to update user: " + err.message);
    }
  }

  async function handleToggleTherapistStatus(id, newStatus) {
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this therapist?`)) return;
    try {
      const response = await adminToggleUserStatus(id);
      if (response?.user) {
        setTherapists(therapists.map(t => (t._id === id ? { ...t, isActive: response.user.isActive } : t)));
      }
    } catch (err) {
      alert("Failed to update therapist: " + err.message);
    }
  }

  async function handleApproveTherapist(id) {
    if (!window.confirm("Approve this therapist?")) return;
    try {
      const data = await adminApproveTherapist(id);
      if (data.success) {
        alert("✅ Therapist approved successfully!");
        // Reload pending therapists and approved therapists
        loadPendingTherapists();
        loadUsers();
      } else {
        alert(data.message || "Error approving therapist");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  }

  async function handleAddTherapist() {
    try {
      const data = await createTherapist({
        name: therapistName,
        email: therapistEmail,
        password: therapistPassword,
        age: therapistAge,
        license: therapistLicense,
      });
      
      if (data.success) {
        alert("✅ Therapist added successfully!");
        setShowAddTherapist(false);
        setTherapistName("");
        setTherapistEmail("");
        setTherapistPassword("");
        setTherapistAge("");
        setTherapistLicense("");
        // Reload therapists list
        loadUsers();
      } else {
        alert(data.message || "Error adding therapist");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  }

  function handleLogout() {
    adminLogout();
    localStorage.removeItem("mm_admin_token");
    localStorage.removeItem("mm_admin");
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    if (tab === "users" || tab === "therapists") loadUsers();
    if (tab === "pending-therapists") loadPendingTherapists();
    if (tab === "products") loadProducts();
    if (tab === "posts") loadPosts();
    if (tab === "questions") loadQuestions();
  }, [tab]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalProducts: products.length,
      totalPosts: posts.length,
    }));
  }, [products, posts]);

  const filteredUsers = users.filter(
    u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredTherapists = therapists.filter(
    t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredPendingTherapists = pendingTherapists.filter(
    t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !showLowStockOnly || p.stock < 50);

  const lowStockProducts = products.filter(p => p.stock < 50);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const hasLowStock = lowStockProducts.length > 0;

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>MindBridge</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
          <button className="nav-item" onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="admin-header">
          <h2>{tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")} Management</h2>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Search + Add Buttons */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <input className="input" placeholder={`Search ${tab.replace("-", " ")}...`} value={search} onChange={e => setSearch(e.target.value)} />
            {tab === "users" && (
              <button className="cta-btn primary" onClick={() => setShowAddTherapist(true)}>
                + Add Therapist
              </button>
            )}
            {tab === "therapists" && (
              <button className="cta-btn primary" onClick={() => setShowAddTherapist(true)}>
                + Add Therapist
              </button>
            )}
            {tab === "products" && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`cta-btn ${showLowStockOnly ? 'active' : ''}`}
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  style={showLowStockOnly ? { backgroundColor: '#ff9800' } : {}}
                >
                  {showLowStockOnly ? '✓ ' : ''}Low Stock Only
                </button>
                <button 
                  className="cta-btn"
                  onClick={() => setShowRestockSuggestions(!showRestockSuggestions)}
                >
                  🔄 Restock Suggestions
                </button>
                <button className="cta-btn primary" onClick={() => setShowAddModal(true)}>
                  + Add Product
                </button>
              </div>
            )}
          </div>
          
          {tab === "products" && hasLowStock && (
            <div className="alert-banner" style={{ 
              backgroundColor: '#fff3e0', 
              padding: '10px', 
              borderRadius: '4px', 
              borderLeft: '4px solid #ff9800',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2em' }}>⚠️</span>
              <div>
                <strong>Low Stock Alert:</strong> {lowStockProducts.length} product(s) have low stock
                {outOfStockProducts.length > 0 && `, ${outOfStockProducts.length} are out of stock`}.
              </div>
            </div>
          )}
          
          {tab === "products" && showRestockSuggestions && (
            <div className="restock-suggestions" style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              border: '1px solid #e0e0e0',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>🔄 Restock Suggestions</h4>
                <button 
                  onClick={() => setShowRestockSuggestions(false)}
                  className="cta-btn"
                  style={{ padding: '4px 10px', fontSize: '0.9em' }}
                >
                  ← Back to Products
                </button>
              </div>
              {lowStockProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lowStockProducts.map(p => (
                    <div key={p._id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: p.stock === 0 ? '#ffebee' : '#fff8e1',
                      borderRadius: '4px'
                    }}>
                      <div>
                        <strong>{p.name}</strong> - {p.category}
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Current stock: {p.stock}
                        </div>
                      </div>
                      <div>
                        Suggested order: {100 - p.stock} units
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No low stock items. Great job! 🎉</p>
              )}
            </div>
          )}
        </div>

        {/* USERS TAB */}
        {tab === "users" && (
          <div>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              filteredUsers.map(u => (
                <div key={u._id} className="user-card">
                  <div>
                    <h4>{u.name}</h4>
                    <p>{u.email}</p>
                    <p>Type: {u.userType || "user"}</p>
                  </div>
                  <button className="cta-btn" onClick={() => handleToggleUserStatus(u._id, !u.isActive)}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* THERAPISTS TAB */}
        {tab === "therapists" && (
          <div>
            {loading ? (
              <p>Loading therapists...</p>
            ) : (
              filteredTherapists.map(t => (
                <div key={t._id} className="user-card">
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.email}</p>
                    <p>License: {t.license || "N/A"}</p>
                    <p>Age: {t.age || "N/A"}</p>
                  </div>
                  <button className="cta-btn" onClick={() => handleToggleTherapistStatus(t._id, !t.isActive)}>
                    {t.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PENDING THERAPISTS TAB */}
        {tab === "pending-therapists" && (
          <div>
            {loading ? (
              <p>Loading pending therapists...</p>
            ) : pendingTherapists.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                <h3>No pending therapists</h3>
                <p>All therapists have been approved.</p>
              </div>
            ) : (
              filteredPendingTherapists.map(t => (
                <div key={t._id} className="user-card">
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.email}</p>
                    <p>License: {t.license || "N/A"}</p>
                    <p>Age: {t.age || "N/A"}</p>
                    <p>Registered: {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="cta-btn primary" onClick={() => handleApproveTherapist(t._id)}>
                    Approve
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            {(showLowStockOnly || showRestockSuggestions) && (
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  onClick={() => {
                    setShowLowStockOnly(false);
                    setShowRestockSuggestions(false);
                  }}
                  className="cta-btn"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    color: '#333'
                  }}
                >
                  ← Show All Products
                </button>
              </div>
            )}
            {loading ? (
              <p>Loading products...</p>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(p => (
                  <div 
                    key={p._id} 
                    className="user-card"
                    style={{
                      borderLeft: p.stock === 0 ? '4px solid #f44336' : 
                                  p.stock < 50 ? '4px solid #ff9800' : '4px solid #4caf50'
                    }}
                  >
                    <h4>{p.name}</h4>
                    {p.image && (
                      <img
                        src={p.image.startsWith("http") ? p.image : `http://localhost:5000${p.image}`}
                        alt={p.name}
                        style={{ width: "100px", height: "100px", borderRadius: "8px" }}
                      />
                    )}
                    <p>₹{p.price}</p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      color: p.stock === 0 ? '#f44336' : p.stock < 50 ? '#ff9800' : '#4caf50',
                      fontWeight: 500
                    }}>
                      Stock: {p.stock}
                      {p.stock < 50 && (
                        <span style={{ 
                          backgroundColor: p.stock === 0 ? '#f44336' : '#ff9800',
                          color: 'white',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.8em',
                          marginLeft: '5px'
                        }}>
                          {p.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="cta-btn"
                        onClick={async () => {
                          const newStock = prompt("Enter new stock:", p.stock);
                          if (!newStock) return;
                          const { product: updated } = await adminUpdateProductStock(p._id, parseInt(newStock));
                          setProducts(products.map(prod => (prod._id === p._id ? updated : prod)));
                        }}
                      >
                        Update Stock
                      </button>
                      <button className="cta-btn danger" onClick={() => handleDeleteProduct(p._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <OrdersManagement />
        )}
      </div>

      {/* Add Therapist Modal */}
      {showAddTherapist && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Therapist</h3>
            <input className="input" placeholder="Name" value={therapistName} onChange={e => setTherapistName(e.target.value)} />
            <input className="input" placeholder="Email" value={therapistEmail} onChange={e => setTherapistEmail(e.target.value)} />
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={therapistPassword}
              onChange={e => setTherapistPassword(e.target.value)}
            />
            <input
              type="number"
              className="input"
              placeholder="Age"
              value={therapistAge}
              onChange={e => setTherapistAge(e.target.value)}
            />
            <input
              className="input"
              placeholder="License"
              value={therapistLicense}
              onChange={e => setTherapistLicense(e.target.value)}
            />
            <div style={{ marginTop: "1rem" }}>
              <button className="cta-btn" onClick={handleAddTherapist}>
                Add Therapist
              </button>
              <button className="cta-btn secondary" onClick={() => setShowAddTherapist(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Product</h3>
            <input className="input" id="product-name" placeholder="Name" />
            <input className="input" id="product-price" placeholder="Price (₹)" type="number" />
            <input className="input" id="product-stock" placeholder="Stock" type="number" />
            <input className="input" id="product-image" placeholder="Image URL" />
            <select className="input" id="product-category">
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <textarea className="input" id="product-description" placeholder="Description"></textarea>
            <div style={{ marginTop: "1rem" }}>
              <button
                className="cta-btn"
                onClick={async () => {
                  const name = document.getElementById("product-name").value.trim();
                  const price = parseFloat(document.getElementById("product-price").value);
                  const stock = parseInt(document.getElementById("product-stock").value);
                  const image = document.getElementById("product-image").value.trim();
                  const category = document.getElementById("product-category").value.trim();
                  const description = document.getElementById("product-description").value.trim();

                  if (!name || !price || !stock || !image || !category) return alert("Please fill all fields");

                  try {
                    const { product } = await adminCreateProduct({ name, price, stock, image, category, description });
                    setProducts([...products, product]);
                    alert("✅ Product added!");
                    setShowAddModal(false);
                  } catch (err) {
                    alert("Error adding product: " + err.message);
                  }
                }}
              >
                Add Product
              </button>
              <button className="cta-btn secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}