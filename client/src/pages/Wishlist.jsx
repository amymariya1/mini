import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { getWishlist, removeFromWishlist } from "../services/wishlist";
import { formatINR } from "../utils/currency";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  // Load wishlist on mount
  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const handleRemoveFromWishlist = (productId) => {
    const updatedWishlist = removeFromWishlist(productId);
    setWishlist(updatedWishlist);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    // Add to cart logic would go here
    // For now, we'll just show an alert
    alert(`${product.name} added to cart!`);
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
            <h1>My Wishlist</h1>
            <p>Products you've saved for later</p>
          </motion.div>
        </div>
      </header>

      <div className="shopping-container">
        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <h3>Your wishlist is empty</h3>
            <p>Start adding products you love to your wishlist</p>
            <Link to="/shopping" className="cta-btn" style={{ display: 'inline-block', marginTop: '16px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            <div className="wishlist-header">
              <h2>{wishlist.length} items in your wishlist</h2>
            </div>
            
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat( auto-fill, minmax(240px, 1fr) )',
                gap: 12
              }}
            >
              {wishlist.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Remove from wishlist button */}
                  <button
                    className="remove-wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>
                  
                  {/* Product image */}
                  <div 
                    style={{ width: '100%', paddingTop: '56%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f7f7f7', cursor: 'pointer' }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {typeof product.image === 'string' && product.image.trim().length > 0 ? (
                      <img
                        alt={product.name}
                        src={product.image.trim()}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-size="16">No image</text></svg>';
                        }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <span className="cart-emoji" style={{ fontSize: 24 }}>🛍️</span>
                      </div>
                    )}
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

                  {/* Product info */}
                  <div className="product-info" style={{ cursor: 'pointer' }} onClick={() => handleProductClick(product.id)}>
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
                  </div>

                  {/* Action buttons */}
                  <div style={{ marginTop: 'auto' }}>
                    <button
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        product.inStock && handleAddToCart(product);
                      }}
                      disabled={!product.inStock}
                      style={{ width: '100%' }}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}