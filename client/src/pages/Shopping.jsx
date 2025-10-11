import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { listProducts } from "../services/api";
import { formatINR } from "../utils/currency";

const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Meditation", value: "Meditation" },
  { name: "Sleep", value: "Sleep" },
  { name: "Yoga", value: "Yoga" },
  { name: "Aromatherapy", value: "Aromatherapy" },
  { name: "Books", value: "Books" },
  { name: "Crystals", value: "Crystals" },
  { name: "Wellness", value: "Wellness" }
];

export default function Shopping() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mm_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (_) {}
  }, []);

  // Persist cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('mm_cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  // Reopen cart if flagged (e.g., after returning from checkout)
  useEffect(() => {
    const flag = localStorage.getItem('mm_reopen_cart');
    if (flag === '1') {
      setShowCart(true);
      localStorage.removeItem('mm_reopen_cart');
    }
  }, []);

  // Load from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await listProducts();
        const list = (data.products || []).map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice || 0,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          image: p.image || '🛍️',
          category: p.category || 'General',
          description: p.description || '',
          inStock: p.inStock !== false,
          badge: p.badge || ''
        }));
        setProducts(list);
        setFilteredProducts(list);
      } catch (err) {
        // keep empty state if API unavailable
        setProducts([]);
        setFilteredProducts([]);
      }
    }
    load();
  }, []);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => String(b.id).localeCompare(String(a.id))); // fallback if no createdAt here
        break;
      default:
        // Keep original order for "featured"
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, sortBy, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Add item and open cart immediately
  const buyNow = (product) => {
    if (!product?.inStock) return;
    addToCart(product);
    setShowCart(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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
            <h1>Wellness Store</h1>
            <p>Discover products for your mental health and wellness journey</p>
          </motion.div>
        </div>
      </header>

      <div className="shopping-container">
        <div className="shopping-layout">
          {/* Sidebar */}
          <aside className="shopping-sidebar">
            <div className="sidebar-section">
              <h3>Categories</h3>
              <div className="category-list">
                {CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Price Range</h3>
              <div className="price-range">
                <input type="range" min="0" max="200" className="price-slider" />
                <div className="price-labels">
                  <span>{formatINR(0)}</span>
                  <span>{formatINR(200)}+</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Rating</h3>
              <div className="rating-filters">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="rating-filter">
                    <input type="checkbox" />
                    <span className="stars">
                      {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                    </span>
                    <span>& up</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="shopping-main">
            {/* Search and Sort */}
            <div className="shopping-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">🔍</button>
              </div>

              <div className="sort-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <button 
                className="cart-toggle"
                onClick={() => setShowCart(!showCart)}
              >
                🛒 Cart ({getTotalItems()})
              </button>
            </div>

            {/* Products Grid (styled like Admin Dashboard) */}
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat( auto-fill, minmax(240px, 1fr) )',
                gap: 12
              }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Image wrapper (Admin-style) */}
                  {typeof product.image === 'string' && product.image.trim().length > 0 ? (
                    <div style={{ width: '100%', paddingTop: '56%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f7f7f7' }}>
                      <img
                        alt={product.name}
                        src={product.image.trim()}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-size="16">No image</text></svg>';
                        }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {product.badge && (
                        <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}
                              style={{ position: 'absolute', top: 8, left: 8 }}>
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <div className="out-of-stock" style={{ position: 'absolute', inset: 0 }}>Out of Stock</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: 120, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative' }}>
                      <span className="cart-emoji" style={{ fontSize: 24 }}>🛍️</span>
                      {product.badge && (
                        <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}
                              style={{ position: 'absolute', top: 8, left: 8 }}>
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <div className="out-of-stock" style={{ position: 'absolute', inset: 0 }}>Out of Stock</div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(product.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                      </span>
                      <span className="rating-text">
                        {(product.rating || 0)} ({product.reviews || 0})
                      </span>
                    </div>

                    <div className="product-pricing">
                      <span className="current-price">{formatINR(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">{formatINR(product.originalPrice)}</span>
                      )}
                    </div>

                    <button
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        product.inStock && addToCart(product);
                      }}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    {product.inStock && (
                      <button
                        className="buy-now-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          buyNow(product);
                        }}
                        style={{ marginTop: 8, width: '100%' }}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <motion.div
          className="cart-sidebar"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="cart-header">
            <h3>Shopping Cart ({getTotalItems()})</h3>
            <button 
              className="close-cart"
              onClick={() => setShowCart(false)}
            >
              ✕
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <Link to="/shopping" onClick={() => setShowCart(false)}>
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {typeof item.image === 'string' && item.image.trim().startsWith('http') ? (
                      <img
                        alt={item.name}
                        src={item.image.trim()}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="cart-emoji">{item.image || '🛍️'}</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{formatINR(item.price)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <strong>Total: {formatINR(getTotalPrice())}</strong>
              </div>
              <button
                className="checkout-btn"
                onClick={() => {
                  // Ensure cart persists and mark to reopen when user returns
                  try { localStorage.setItem('mm_cart', JSON.stringify(cart)); } catch (_) {}
                  localStorage.setItem('mm_reopen_cart', '1');
                  setShowCart(false);
                  navigate('/checkout/address');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Cart Overlay */}
      {showCart && (
        <div 
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        />
      )}
    </div>
  );
}
