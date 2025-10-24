import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const OrderManagement = ({ orders, products, loading, onStatusUpdate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const statusColors = {
    pending: "#ff9800",
    confirmed: "#2196f3",
    processing: "#9c27b0",
    shipped: "#ff5722",
    delivered: "#4caf50",
    cancelled: "#f44336"
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  // Get product details for an order item
  const getProductDetails = (productId) => {
    return products.find(product => product._id === productId) || null;
  };

  // Calculate sales data for charts
  const getSalesData = () => {
    const productSales = {};
    const categorySales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = getProductDetails(item.productId);
        if (product) {
          // Product sales count
          if (!productSales[product.name]) {
            productSales[product.name] = { name: product.name, sales: 0, revenue: 0 };
          }
          productSales[product.name].sales += item.quantity;
          productSales[product.name].revenue += item.price * item.quantity;

          // Category sales count
          const category = product.category || "Uncategorized";
          if (!categorySales[category]) {
            categorySales[category] = { name: category, sales: 0, revenue: 0 };
          }
          categorySales[category].sales += item.quantity;
          categorySales[category].revenue += item.price * item.quantity;
        }
      });
    });

    // Convert to arrays and sort by sales
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const topCategories = Object.values(categorySales)
      .sort((a, b) => b.sales - a.sales);

    return { topProducts, topCategories };
  };

  const { topProducts, topCategories } = getSalesData();

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#4ECDC4"];

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;
    onStatusUpdate(selectedOrder._id, newStatus, statusNote);
    setStatusModal(false);
    setSelectedOrder(null);
    setNewStatus("");
    setStatusNote("");
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '3rem' }}
        >
          📦
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>📦 Order Management</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
          Track and manage all customer orders
        </p>
      </motion.div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '30px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
          <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Total Orders</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>{orders.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '30px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(240, 147, 251, 0.3)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
          <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Pending Orders</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>
            {orders.filter(o => o.status === "pending").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '30px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(79, 172, 254, 0.3)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Total Revenue</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2rem', fontWeight: 700 }}>
            {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '16px',
            padding: '30px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(67, 233, 123, 0.3)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Delivered</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>
            {orders.filter(o => o.status === "delivered").length}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#333' }}>📈 Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, "Units Sold"]} />
              <Legend />
              <Bar dataKey="sales" name="Units Sold" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#333' }}>🎯 Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topCategories}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
                nameKey="name"
              >
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Units Sold"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px 30px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <label style={{ fontWeight: 600, color: '#333' }}>Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '1rem',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Orders ({orders.length})</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} ({orders.filter(o => o.status === option.value).length})
            </option>
          ))}
        </select>
      </motion.div>

      {/* Orders List */}
      <div>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: '#333' }}>
          📦 Orders ({filteredOrders.length})
        </h2>
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📭</div>
            <h3 style={{ color: '#666', margin: 0 }}>No orders found</h3>
            <p style={{ color: '#999', marginTop: '10px' }}>Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderLeft: `6px solid ${statusColors[order.status] || "#9e9e9e"}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Order #{order.orderId}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#999' }}>{formatDate(order.createdAt)}</p>
                </div>
                <span
                  style={{
                    backgroundColor: statusColors[order.status] || "#9e9e9e",
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Customer</p>
                  <p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#333' }}>{order.userEmail}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Amount</p>
                  <p style={{ margin: '5px 0 0 0', fontWeight: 700, color: '#667eea', fontSize: '1.2rem' }}>{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Items</p>
                  <p style={{ margin: '5px 0 0 0', fontWeight: 600, color: '#333' }}>{order.items.length} products</p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1.1rem' }}>📦 Products:</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {order.items.map((item, idx) => {
                    const product = getProductDetails(item.productId);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          background: '#f8f9fa',
                          borderRadius: '8px'
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#333' }}>
                          {product ? product.name : item.name}
                        </span>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <span style={{ color: '#666' }}>Qty: {item.quantity}</span>
                          <span style={{ fontWeight: 600, color: '#667eea' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setStatusModal(true);
                    setNewStatus(order.status);
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Update Status
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {statusModal && selectedOrder && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => {
            setStatusModal(false);
            setSelectedOrder(null);
            setNewStatus("");
            setStatusNote("");
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: '#333' }}>Update Order Status</h2>
            <p style={{ margin: '0 0 30px 0', color: '#666' }}>Order #{selectedOrder.orderId}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#333' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#333' }}>
                Note (Optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status update..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStatusUpdate}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Update Status
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatus("");
                  setStatusNote("");
                }}
                style={{
                  flex: 1,
                  background: 'white',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;