import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { listProducts, getCart, saveCart } from "../services/api";
import { formatINR } from "../utils/currency";
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from "../services/wishlist";
import { getRecentlyViewedProducts } from "../services/recommendations";

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
  const [wishlist, setWishlist] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
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
      console.error('Error getting user ID:', error);
    }
  }, []);

  // Load cart from backend on mount
  useEffect(() => {
    async function loadCart() {
      if (!userId) return;
      
      try {
        console.log('Loading cart from backend for user:', userId);
        const response = await getCart(userId);
        const cartData = response.cart?.items || [];
        setCart(cartData);
      } catch (error) {
        console.error('Error loading cart from backend:', error);
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem('mm_cart');
          console.log('Loading cart from localStorage as fallback:', raw);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setCart(parsed);
          }
        } catch (localStorageError) {
          console.error('Error loading cart from localStorage:', localStorageError);
        }
      }
    }
    
    loadCart();
  }, [userId]);

  // Persist cart to backend when it changes
  useEffect(() => {
    async function persistCart() {
      if (!userId) {
        // Fallback to localStorage if no user ID
        try {
          console.log('Saving cart to localStorage (no user ID):', cart);
          localStorage.setItem('mm_cart', JSON.stringify(cart));
        } catch (error) {
          console.error('Error saving cart to localStorage:', error);
        }
        return;
      }
      
      try {
        console.log('Saving cart to backend for user:', userId, cart);
        await saveCart(userId, cart);
      } catch (error) {
        console.error('Error saving cart to backend:', error);
        // Fallback to localStorage
        try {
          console.log('Saving cart to localStorage as fallback:', cart);
          localStorage.setItem('mm_cart', JSON.stringify(cart));
        } catch (localStorageError) {
          console.error('Error saving cart to localStorage:', localStorageError);
        }
      }
    }
    
    persistCart();
  }, [cart, userId]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

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

  // Load recently viewed products
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewedProducts());
  }, []);

  // Filter products based on all criteria
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(product => 
        selectedRatings.some(rating => Math.floor(product.rating) >= rating)
      );
    }

    // In stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
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
      case "reviews":
        filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        // Keep original order for "featured"
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, sortBy, products, priceRange, selectedRatings, inStockOnly]);

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

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      const updatedWishlist = removeFromWishlist(product.id);
      setWishlist(updatedWishlist);
    } else {
      const updatedWishlist = addToWishlist(product);
      setWishlist(updatedWishlist);
    }
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    // Ensure min doesn't exceed max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    }
    if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    setPriceRange(newRange);
  };

  const toggleRatingFilter = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setPriceRange([0, 5000]);
    setSelectedRatings([]);
    setInStockOnly(false);
  };

  // Render star rating
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '☆' : ''}
        {'☆'.repeat(emptyStars)}
      </div>
    );
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
        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="recently-viewed-section">
            <div className="section-header">
              <h2>Recently Viewed</h2>
            </div>
            <div className="products-grid">
              {recentlyViewed.map((product) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image-container">
                    {typeof product.image === 'string' && product.image.trim().length > 0 ? (
                      <img
                        alt={product.name}
                        src={product.image.trim()}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-size="16">No image</text></svg>';
                        }}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <span className="product-emoji">🛍️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="product-rating-container">
                      {renderRating(product.rating || 0)}
                      <span className="rating-text">
                        {(product.rating || 0).toFixed(1)} ({product.reviews || 0})
                      </span>
                    </div>
                    
                    <div className="product-pricing">
                      <span className="current-price">{formatINR(product.price)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="shopping-layout">
          {/* Sidebar */}
          <aside className="shopping-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-header">
                <h3>Filters</h3>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="sidebar-section">
              <h3>Categories</h3>
              <div className="category-list">
                {CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    className={`btn category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Price Range</h3>
              <div className="price-filter">
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label>Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      className="form-input"
                      min="0"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                <div className="price-slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    value={priceRange[0]} 
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="price-slider"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    value={priceRange[1]} 
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="price-slider"
                  />
                </div>
                <div className="price-labels">
                  <span>{formatINR(priceRange[0])}</span>
                  <span>{formatINR(priceRange[1])}+</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Minimum Rating</h3>
              <div className="rating-filters">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="rating-filter">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => toggleRatingFilter(rating)}
                    />
                    <span className="stars-container">
                      {renderRating(rating)}
                      <span>& up</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="sidebar-section">
              <label className="stock-filter">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Main Content */}
          <main className="shopping-main">
            {/* Search and Sort */}
            <div className="shopping-controls">
              <div className="search-container">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search products, categories, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                  <button className="btn btn-primary search-btn">
                    🔍
                  </button>
                </div>
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              <div className="shopping-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => setShowCart(!showCart)}
                >
                  🛒 Cart ({getTotalItems()})
                </button>
                <Link to="/wishlist" className="btn btn-outline">
                  ❤️ Wishlist ({wishlist.length})
                </Link>
                <Link to="/orders" className="btn btn-outline">
                  📦 Orders
                </Link>
              </div>
            </div>
            
            {/* Results info */}
            <div className="results-info">
              {filteredProducts.length} of {products.length} products
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Image wrapper */}
                  <div className="product-image-container" onClick={() => handleProductClick(product.id)}>
                    {typeof product.image === 'string' && product.image.trim().length > 0 ? (
                      <div className="image-wrapper">
                        <img
                          alt={product.name}
                          src={product.image.trim()}
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-size="16">No image</text></svg>';
                          }}
                          className="product-image"
                        />
                        {product.badge && (
                          <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                            {product.badge}
                          </span>
                        )}
                        {!product.inStock && (
                          <div className="out-of-stock-overlay">Out of Stock</div>
                        )}
                      </div>
                    ) : (
                      <div className="product-image-placeholder">
                        <span className="product-emoji">🛍️</span>
                        {product.badge && (
                          <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                            {product.badge}
                          </span>
                        )}
                        {!product.inStock && (
                          <div className="out-of-stock-overlay">Out of Stock</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Wishlist button */}
                  <button
                    className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                  >
                    {isInWishlist(product.id) ? '❤️' : '🤍'}
                  </button>

                  {/* Info */}
                  <div className="product-info" onClick={() => handleProductClick(product.id)}>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-rating-container">
                      {renderRating(product.rating || 0)}
                      <span className="rating-text">
                        {(product.rating || 0).toFixed(1)} ({product.reviews || 0})
                      </span>
                    </div>

                    <div className="product-pricing">
                      <span className="current-price">{formatINR(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">{formatINR(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="product-actions">
                    <button
                      className={`btn ${!product.inStock ? 'btn-secondary' : 'btn-primary'} add-to-cart-btn`}
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
                        className="btn btn-success buy-now-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          buyNow(product);
                        }}
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
                <button 
                  className="btn btn-secondary"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
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
              className="btn btn-icon close-cart"
              onClick={() => setShowCart(false)}
            >
              ✕
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <Link to="/shopping" className="btn btn-primary" onClick={() => setShowCart(false)}>
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
                    <p className="cart-item-price">{formatINR(item.price)}</p>
                    <div className="quantity-controls">
                      <button 
                        className="btn btn-icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="btn btn-icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-icon remove-item"
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
                className="btn btn-success checkout-btn"
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