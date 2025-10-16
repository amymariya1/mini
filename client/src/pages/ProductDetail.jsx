import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { getProduct } from "../services/api";
import { isInWishlist, addToWishlist, removeFromWishlist } from "../services/wishlist";
import { getProductReviews, addProductReview } from "../services/reviews";
import { getRecommendedProducts, addRecentlyViewedProduct } from "../services/recommendations";
import { formatINR } from "../utils/currency";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Fetch product details by ID
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(id);
        if (data && data.product) {
          setProduct(data.product);
          // Check if product is in wishlist
          setInWishlist(isInWishlist(data.product._id));
          // Add to recently viewed
          addRecentlyViewedProduct({
            id: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.image,
            category: data.product.category,
            rating: data.product.rating,
            reviews: data.product.reviews
          });
        } else {
          console.error("No product data received");
          navigate("/shopping");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        navigate("/shopping");
      }
    }
    fetchProduct();
  }, [id, navigate]);

  // Fetch product reviews
  useEffect(() => {
    async function fetchReviews() {
      if (!id) return;
      
      try {
        setLoadingReviews(true);
        const data = await getProductReviews(id);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [id]);

  // Fetch recommended products
  useEffect(() => {
    async function fetchRecommendations() {
      if (!id) return;
      
      try {
        setLoadingRecommendations(true);
        const data = await getRecommendedProducts(id);
        setRecommendedProducts(data.products || []);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    }
    fetchRecommendations();
  }, [id]);

  const toggleWishlist = () => {
    if (product) {
      if (inWishlist) {
        removeFromWishlist(product._id);
      } else {
        addToWishlist({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          inStock: product.stock > 0,
          rating: product.rating || 0,
          reviews: product.reviews || 0
        });
      }
      setInWishlist(!inWishlist);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      setReviewError("Title and comment are required");
      return;
    }
    
    try {
      const data = await addProductReview(id, reviewForm);
      // Add the new review to the list
      setReviews(prev => [data.review, ...prev]);
      // Reset form
      setReviewForm({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
    } catch (error) {
      setReviewError(error.message || "Failed to submit review");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (!product) {
    return (
      <div className="shopping-page">
        <Navbar />
        <div className="shopping-container">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // ✅ Handle image URL (backend or full URL)
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `http://localhost:5000${product.image || "/uploads/default.jpg"}`;

  return (
    <div className="shopping-page">
      <Navbar />
      <div className="shopping-container">
        <div style={{ margin: "20px 0" }}>
          <button className="chip" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div
          className="product-detail"
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px"
          }}
        >
          {/* 🖼️ Product Image */}
          <div
            className="product-detail-image"
            style={{
              flex: "1 1 40%",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              position: "relative",
            }}
          >
            <img
              src={imageUrl}
              alt={product.name}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/no-image.png";
              }}
            />
            {/* Wishlist button */}
            <button
              className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
              onClick={toggleWishlist}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>

          {/* 📦 Product Info */}
          <div className="product-detail-info" style={{ flex: "1 1 60%" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "600" }}>
              {product.name}
            </h1>

            <p style={{ color: "#888", marginTop: "4px" }}>
              Category: <strong>{product.category || "General"}</strong>
            </p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
              <div className="product-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                </span>
              </div>
              <span style={{ marginLeft: '8px', color: '#64748b' }}>
                {product.rating ? product.rating.toFixed(1) : 'No ratings'} 
                {product.reviews > 0 && ` (${product.reviews} reviews)`}
              </span>
            </div>

            <div
              style={{
                marginTop: "16px",
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#111",
              }}
            >
              ₹{product.price}
            </div>

            <p
              style={{
                marginTop: "6px",
                fontSize: "1rem",
                color: product.stock > 0 ? "green" : "red",
              }}
            >
              Stock: <strong>{product.stock}</strong>
            </p>

            {product.description && (
              <p style={{ marginTop: "12px", color: "#444" }}>
                {product.description}
              </p>
            )}

            <div style={{ marginTop: "20px" }}>
              <button
                className="cta-btn"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  cursor: "pointer",
                  border: "none",
                  fontSize: "16px"
                }}
                onClick={() => alert("Added to cart!")}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div
          className="product-reviews"
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Customer Reviews</h2>
            <button 
              className="secondary-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{ padding: '8px 16px' }}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginTop: 0 }}>Write Your Review</h3>
              {reviewError && (
                <div style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 16,
                  border: "1px solid #fecaca"
                }}>{reviewError}</div>
              )}
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '24px',
                          cursor: 'pointer',
                          color: star <= reviewForm.rating ? '#f59e0b' : '#d1d5db'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={reviewForm.title}
                    onChange={handleReviewChange}
                    className="input"
                    placeholder="Give your review a title"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Review</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    className="input"
                    placeholder="Share your experience with this product"
                    rows="4"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="cta-btn"
                    style={{ color: "black" }}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {reviews.map(review => (
                <div 
                  key={review._id} 
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid #e2e8f0' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>{review.title}</h4>
                    <div className="product-rating">
                      <span className="stars">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#64748b', margin: '8px 0' }}>
                    by {review.user?.name || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '8px 0 0 0' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Products */}
        <div
          className="product-recommendations"
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <h2 style={{ margin: '0 0 20px 0' }}>Frequently Bought Together</h2>
          
          {loadingRecommendations ? (
            <p>Loading recommendations...</p>
          ) : recommendedProducts.length === 0 ? (
            <p>No recommendations available for this product.</p>
          ) : (
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16
              }}
            >
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8, 
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div style={{ 
                    width: '100%', 
                    paddingTop: '75%', 
                    position: 'relative', 
                    borderRadius: 4, 
                    overflow: 'hidden', 
                    background: '#f7f7f7' 
                  }}>
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
                      <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#64748b' 
                      }}>
                        <span className="cart-emoji" style={{ fontSize: 20 }}>🛍️</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 
                    className="product-name" 
                    style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      lineHeight: '1.4', 
                      height: '40px', 
                      overflow: 'hidden' 
                    }}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-rating" style={{ fontSize: '12px' }}>
                    <span className="stars">
                      {'★'.repeat(Math.floor(product.rating || 0))}
                      {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                    </span>
                    <span className="rating-text">
                      {(product.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="product-pricing" style={{ marginTop: '4px' }}>
                    <span className="current-price" style={{ fontSize: '16px', fontWeight: '600' }}>
                      {formatINR(product.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}