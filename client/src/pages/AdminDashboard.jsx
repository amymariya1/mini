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
  adminDeleteUser,
  adminDeleteProduct,
  adminDeletePost,
  adminDeleteQuestion,
  adminCreateProduct,
  adminUpdateProductStock,
  createTherapist,
  adminGetAllOrders,
  adminUpdateOrderStatus
} from "../services/api";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import "../styles/AdminDashboard.css";

// Add the import for the new OrderManagement component
import OrderManagement from "../components/OrderManagement";

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
  { id: "dashboard", label: "Dashboard", icon: <ProductsIcon />, emoji: "📊" },
  { id: "users", label: "Users", icon: <UsersIcon />, emoji: "👥" },
  { id: "therapists", label: "Therapists", icon: <TherapistsIcon />, emoji: "👩‍⚕️" },
  { id: "pending-therapists", label: "Pending Therapists", icon: <PendingIcon />, emoji: "⏳" },
  { id: "products", label: "Products", icon: <ProductsIcon />, emoji: "🛍️" },
  { id: "orders", label: "Orders", icon: <ProductsIcon />, emoji: "📦" },
  { id: "posts", label: "Posts", icon: <PostsIcon />, emoji: "📝" },
];

export default function AdminDashboard() {
  const { isDarkMode, colors } = useTheme();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalProducts: 0, totalPosts: 0, totalTherapists: 0 });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      const regularUsers = usersData.filter(u => u.userType !== "therapist");
      const approvedTherapists = usersData.filter(u => u.userType === "therapist" && u.isApproved);
      setUsers(regularUsers);
      setTherapists(approvedTherapists);
      setStats(prev => ({
        ...prev,
        totalUsers: regularUsers.length,
        activeUsers: regularUsers.filter(u => u.isActive).length,
        totalTherapists: approvedTherapists.length
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

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await adminGetAllOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
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

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await adminDeleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user: " + err.message);
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



  async function handleOrderStatusUpdate(orderId, status, note) {
    try {
      const response = await adminUpdateOrderStatus(orderId, status, note);
      if (response.success) {
        // Update order in state
        setOrders(orders.map(order => 
          order._id === orderId ? response.order : order
        ));
        
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  useEffect(() => {
    if (tab === "users" || tab === "therapists") loadUsers();
    if (tab === "pending-therapists") loadPendingTherapists();
    if (tab === "products") loadProducts();
    if (tab === "posts") loadPosts();
    if (tab === "questions") loadQuestions();
    if (tab === "orders") loadOrders();
    // For videos tab, we would load videos here in a real implementation
  }, [tab]);

  // Load all data on initial mount for dashboard stats
  useEffect(() => {
    loadUsers();
    loadProducts();
    loadPosts();
  }, []);

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

  async function handleOrderStatusUpdate(orderId, status, note) {
    try {
      const response = await adminUpdateOrderStatus(orderId, status, note);
      if (response.success) {
        // Update order in state
        setOrders(orders.map(order => 
          order._id === orderId ? response.order : order
        ));
        
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDarkMode ? '#0f172a' : '#f8fafc',
      padding: '0'
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: isDarkMode ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            MindMirror Admin
          </h2>
          {tab !== 'dashboard' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab('dashboard')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isDarkMode ? '#334155' : '#f1f5f9',
                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              ← Back to Dashboard
            </motion.button>
          )}
        </div>

        {/* Profile Menu */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              border: `2px solid ${isDarkMode ? '#667eea' : '#667eea'}`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            👤
          </motion.button>

          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: '55px',
                right: 0,
                background: isDarkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '8px',
                minWidth: '200px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 1000
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                marginBottom: '8px'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontWeight: 600,
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.95rem'
                }}>
                  Admin User
                </p>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '0.85rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b'
                }}>
                  Administrator
                </p>
              </div>
              
              <motion.button
                whileHover={{ backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }}
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left'
                }}
              >
                🚪 Logout
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#991b1b'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Dashboard Overview */}
        {tab === "dashboard" && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)' }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  padding: '28px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setTab('users')}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.totalUsers}</h3>
                <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Total Users</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(79, 172, 254, 0.2)' }}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '20px',
                  padding: '28px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setTab('products')}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛍️</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.totalProducts}</h3>
                <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Products</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(240, 147, 251, 0.2)' }}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '20px',
                  padding: '28px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setTab('therapists')}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👩‍⚕️</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.totalTherapists}</h3>
                <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Therapists</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(67, 233, 123, 0.2)' }}
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: '20px',
                  padding: '28px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setTab('posts')}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stats.totalPosts}</h3>
                <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Blog Posts</p>
              </motion.div>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>Quick Actions</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {NAV_ITEMS.filter(item => item.id !== 'dashboard').map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => setTab(item.id)}
                  style={{
                    background: isDarkMode ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{item.emoji}</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
                    {item.label}
                  </h3>
                  <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>
                    Manage {item.label.toLowerCase()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Add Buttons */}
        {tab !== "dashboard" && (
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
        )}

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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="cta-btn" onClick={() => handleToggleUserStatus(u._id, !u.isActive)}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className="cta-btn danger" onClick={() => handleDeleteUser(u._id)}>
                      Delete
                    </button>
                  </div>
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="cta-btn" onClick={() => handleToggleTherapistStatus(t._id, !t.isActive)}>
                      {t.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className="cta-btn danger" onClick={() => handleDeleteUser(t._id)}>
                      Delete
                    </button>
                  </div>
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="cta-btn primary" onClick={() => handleApproveTherapist(t._id)}>
                      Approve
                    </button>
                    <button className="cta-btn danger" onClick={() => handleDeleteUser(t._id)}>
                      Delete
                    </button>
                  </div>
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

        {/* POSTS TAB */}
        {tab === "posts" && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>📝 Blog Posts</h3>
            {loading ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <h3>No posts yet</h3>
                <p>Create your first blog post to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {posts.map(post => (
                  <div key={post._id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{post.title}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                          By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                          {post.content?.substring(0, 150)}...
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {post.tags?.map((tag, idx) => (
                            <span 
                              key={idx}
                              style={{
                                padding: '4px 12px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                borderRadius: '12px',
                                fontSize: '0.85rem'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '20px' }}>
                        <span 
                          style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            background: post.status === 'approved' ? '#e8f5e9' : post.status === 'rejected' ? '#ffebee' : '#fff3e0',
                            color: post.status === 'approved' ? '#2e7d32' : post.status === 'rejected' ? '#c62828' : '#f57c00'
                          }}
                        >
                          {post.status === 'approved' ? '✓ Approved' : post.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                        </span>
                        {post.published && (
                          <span 
                            style={{
                              padding: '6px 16px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textAlign: 'center',
                              background: '#e8f5e9',
                              color: '#2e7d32'
                            }}
                          >
                            📢 Published
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          // View post details
                          window.open(`/blog/${post._id}`, '_blank');
                        }}
                        style={{ flex: 1 }}
                      >
                        View Post
                      </button>
                      {post.status === 'pending' && (
                        <>
                          <button 
                            className="btn"
                            onClick={async () => {
                              try {
                                // Call approve API
                                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/posts/${post._id}/approve`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('mm_admin_token')}`
                                  }
                                });
                                if (response.ok) {
                                  alert('Post approved successfully!');
                                  loadPosts(); // Reload posts
                                }
                              } catch (err) {
                                alert('Failed to approve post');
                              }
                            }}
                            style={{ flex: 1, background: '#4caf50', color: 'white' }}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="btn"
                            onClick={async () => {
                              const reason = prompt('Reason for rejection (optional):');
                              try {
                                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/posts/${post._id}/reject`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('mm_admin_token')}`
                                  },
                                  body: JSON.stringify({ reason })
                                });
                                if (response.ok) {
                                  alert('Post rejected');
                                  loadPosts(); // Reload posts
                                }
                              } catch (err) {
                                alert('Failed to reject post');
                              }
                            }}
                            style={{ flex: 1, background: '#f44336', color: 'white' }}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button 
                        className="btn btn-secondary"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this post?')) {
                            try {
                              const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/posts/${post._id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('mm_admin_token')}`
                                }
                              });
                              if (response.ok) {
                                alert('Post deleted successfully!');
                                loadPosts(); // Reload posts
                              }
                            } catch (err) {
                              alert('Failed to delete post');
                            }
                          }
                        }}
                        style={{ background: '#757575', color: 'white' }}
                      >
                        🗑️ Delete
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
          <OrderManagement 
            orders={orders}
            products={products}
            loading={loading}
            onStatusUpdate={handleOrderStatusUpdate}
          />
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
