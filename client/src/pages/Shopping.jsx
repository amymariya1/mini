import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

// Sample product data
const PRODUCTS = [
  {
    id: 1,
    name: "Meditation Cushion Set",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: 1247,
    image: "🧘‍♀️",
    category: "Meditation",
    description: "Premium zafu and zabuton meditation cushion set for comfortable sitting practice",
    inStock: true,
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Essential Oil Diffuser",
    price: 45.99,
    originalPrice: 65.99,
    rating: 4.6,
    reviews: 892,
    image: "https://img.freepik.com/premium-photo/oil-diffuser-white-background_894067-23935.jpg?w=2000",
    category: "Aromatherapy",
    description: "Ultrasonic essential oil diffuser with LED lights and timer function",
    inStock: true,
    badge: "Sale"
  },
  {
    id: 3,
    name: "Weighted Blanket",
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviews: 2156,
    image: "🛏️",
    category: "Sleep",
    description: "15lb weighted blanket for better sleep and anxiety relief",
    inStock: true,
    badge: "Prime"
  },
  {
    id: 4,
    name: "Yoga Mat Pro",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviews: 1834,
    image: "🧘",
    category: "Yoga",
    description: "Non-slip eco-friendly yoga mat with carrying strap",
    inStock: false,
    badge: "Eco"
  },
  {
    id: 5,
    name: "Crystal Healing Set",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviews: 567,
    image: "💎",
    category: "Crystals",
    description: "7-piece crystal healing set with guidebook and storage bag",
    inStock: true,
    badge: "New"
  },
  {
    id: 6,
    name: "Sleep Sound Machine",
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.8,
    reviews: 1123,
    image: "🌊",
    category: "Sleep",
    description: "White noise machine with 20+ nature sounds and timer",
    inStock: true,
    badge: "Popular"
  },
  {
    id: 7,
    name: "Mindfulness Journal",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.6,
    reviews: 445,
    image: "📔",
    category: "Books",
    description: "365-day guided mindfulness journal with daily prompts",
    inStock: true,
    badge: "Guide"
  },
  {
    id: 8,
    name: "Herbal Tea Collection",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 789,
    image: "🍵",
    category: "Wellness",
    description: "Organic herbal tea collection with 12 calming blends",
    inStock: true,
    badge: "Organic"
  }
];

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
  const [products, setProducts] = useState(PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => b.id - a.id);
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
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                  <span>$0</span>
                  <span>$200+</span>
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

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    {typeof product.image === 'string' && product.image.startsWith('http') ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-photo"
                        style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '12px', background: '#fff' }}
                      />
                    ) : (
                      <div className="product-emoji">{product.image}</div>
                    )}
                    {product.badge && (
                      <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                        {product.badge}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="out-of-stock">Out of Stock</div>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </span>
                      <span className="rating-text">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="product-pricing">
                      <span className="current-price">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">${product.originalPrice}</span>
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
                    <div className="cart-emoji">{item.image}</div>
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>${item.price}</p>
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
                <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
              </div>
              <button className="checkout-btn">
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
