import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

// Extended product data with more details
const PRODUCTS_DATA = {
  1: {
    id: 1,
    name: "Meditation Cushion Set",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: 1247,
    image: "🧘‍♀️",
    category: "Meditation",
    description: "Premium zafu and zabuton meditation cushion set for comfortable sitting practice",
    longDescription: "Transform your meditation practice with our premium meditation cushion set. This complete set includes a traditional zafu (round cushion) and zabuton (rectangular mat) designed for optimal comfort during extended meditation sessions. Made from high-quality buckwheat hull filling and durable cotton covers, these cushions provide the perfect balance of firmness and comfort.",
    inStock: true,
    badge: "Best Seller",
    colors: ["Natural Beige", "Deep Navy", "Sage Green", "Charcoal Gray"],
    sizes: ["Standard", "Large"],
    features: [
      "100% Organic Cotton Cover",
      "Buckwheat Hull Filling",
      "Machine Washable",
      "Non-slip Bottom",
      "Handcrafted Quality"
    ],
    specifications: {
      "Zafu Dimensions": "14\" diameter x 6\" height",
      "Zabuton Dimensions": "28\" x 20\" x 2\"",
      "Weight": "3.2 lbs",
      "Material": "Organic Cotton, Buckwheat Hulls",
      "Care Instructions": "Spot clean, air dry"
    },
    soldCount: 2847,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Sarah M.",
        rating: 5,
        comment: "Perfect for my daily meditation practice. Very comfortable and well-made!",
        date: "2 days ago",
        verified: true
      },
      {
        id: 2,
        name: "Michael R.",
        rating: 5,
        comment: "Great quality cushions. The buckwheat filling molds perfectly to your body.",
        date: "1 week ago",
        verified: true
      },
      {
        id: 3,
        name: "Emma L.",
        rating: 4,
        comment: "Love the natural color. Very comfortable for long sessions.",
        date: "2 weeks ago",
        verified: true
      }
    ]
  },
  2: {
    id: 2,
    name: "Essential Oil Diffuser",
    price: 45.99,
    originalPrice: 65.99,
    rating: 4.6,
    reviews: 892,
    image: "https://img.freepik.com/premium-photo/oil-diffuser-white-background_894067-23935.jpg?w=2000",
    category: "Aromatherapy",
    description: "Ultrasonic essential oil diffuser with LED lights and timer function",
    longDescription: "Create a peaceful atmosphere in your home with our advanced ultrasonic essential oil diffuser. Features 7 color-changing LED lights, multiple timer settings, and whisper-quiet operation. Perfect for aromatherapy, meditation, and relaxation. The large water tank provides up to 10 hours of continuous mist.",
    inStock: true,
    badge: "Sale",
    colors: ["White", "Black", "Wood Grain", "Rose Gold"],
    sizes: ["Standard"],
    features: [
      "Ultrasonic Technology",
      "7 Color LED Lights",
      "Timer Function (1/3/6 hours)",
      "Whisper Quiet Operation",
      "Auto Shut-off Safety"
    ],
    specifications: {
      "Capacity": "300ml",
      "Coverage": "Up to 300 sq ft",
      "Runtime": "Up to 10 hours",
      "Power": "15W",
      "Dimensions": "6.3\" x 6.3\" x 5.9\""
    },
    soldCount: 1523,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Jennifer K.",
        rating: 5,
        comment: "Beautiful diffuser with amazing light effects. Perfect for bedtime routine.",
        date: "3 days ago",
        verified: true
      },
      {
        id: 2,
        name: "David P.",
        rating: 4,
        comment: "Great value for money. The mist output is perfect and not too strong.",
        date: "1 week ago",
        verified: true
      }
    ]
  },
  3: {
    id: 3,
    name: "Weighted Blanket",
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviews: 2156,
    image: "🛏️",
    category: "Sleep",
    description: "15lb weighted blanket for better sleep and anxiety relief",
    longDescription: "Experience the therapeutic benefits of deep pressure stimulation with our premium weighted blanket. Made with 100% organic cotton and filled with non-toxic glass beads, this blanket provides gentle, even pressure that promotes relaxation and better sleep. The 15lb weight is ideal for adults and helps reduce anxiety and stress.",
    inStock: true,
    badge: "Prime",
    colors: ["Gray", "Navy", "White", "Sage Green"],
    sizes: ["48\" x 72\"", "60\" x 80\"", "80\" x 87\""],
    features: [
      "100% Organic Cotton",
      "Non-toxic Glass Beads",
      "Even Weight Distribution",
      "Machine Washable",
      "Hypoallergenic"
    ],
    specifications: {
      "Weight": "15 lbs",
      "Material": "100% Organic Cotton",
      "Filling": "Non-toxic Glass Beads",
      "Care": "Machine wash cold, air dry",
      "Certification": "OEKO-TEX Standard 100"
    },
    soldCount: 3847,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Lisa T.",
        rating: 5,
        comment: "Life-changing! I sleep so much better with this weighted blanket.",
        date: "1 day ago",
        verified: true
      },
      {
        id: 2,
        name: "Robert H.",
        rating: 5,
        comment: "Excellent quality and perfect weight. Highly recommend!",
        date: "4 days ago",
        verified: true
      }
    ]
  },
  4: {
    id: 4,
    name: "Yoga Mat Pro",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviews: 1834,
    image: "🧘",
    category: "Yoga",
    description: "Non-slip eco-friendly yoga mat with carrying strap",
    longDescription: "Enhance your yoga practice with our premium non-slip yoga mat. Made from eco-friendly materials, this mat provides excellent grip and cushioning for all types of yoga poses. The textured surface prevents slipping while the closed-cell design resists moisture and bacteria.",
    inStock: false,
    badge: "Eco",
    colors: ["Purple", "Blue", "Pink", "Green"],
    sizes: ["Standard (68\" x 24\")", "Long (72\" x 24\")"],
    features: [
      "Non-slip Surface",
      "Eco-friendly Materials",
      "Closed-cell Design",
      "Carrying Strap Included",
      "Easy to Clean"
    ],
    specifications: {
      "Dimensions": "68\" x 24\" x 0.25\"",
      "Weight": "2.2 lbs",
      "Material": "TPE (Thermoplastic Elastomer)",
      "Thickness": "6mm",
      "Care": "Wipe clean with damp cloth"
    },
    soldCount: 2156,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Jessica M.",
        rating: 5,
        comment: "Perfect grip and great cushioning. Love the eco-friendly aspect!",
        date: "1 week ago",
        verified: true
      },
      {
        id: 2,
        name: "Tom R.",
        rating: 4,
        comment: "Good quality mat, very comfortable for long sessions.",
        date: "2 weeks ago",
        verified: true
      }
    ]
  },
  5: {
    id: 5,
    name: "Crystal Healing Set",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviews: 567,
    image: "💎",
    category: "Crystals",
    description: "7-piece crystal healing set with guidebook and storage bag",
    longDescription: "Discover the power of crystal healing with our comprehensive 7-piece crystal set. Each crystal is carefully selected for its unique healing properties and comes with a detailed guidebook explaining their uses and benefits. Perfect for beginners and experienced practitioners alike.",
    inStock: true,
    badge: "New",
    colors: ["Mixed Colors"],
    sizes: ["Standard Set"],
    features: [
      "7 Healing Crystals",
      "Detailed Guidebook",
      "Storage Bag Included",
      "Cleansing Instructions",
      "Chakra Guide"
    ],
    specifications: {
      "Crystals": "Amethyst, Rose Quartz, Clear Quartz, Citrine, Black Tourmaline, Selenite, Aventurine",
      "Guidebook": "32 pages",
      "Storage": "Velvet drawstring bag",
      "Origin": "Brazil, Madagascar, India",
      "Care": "Cleanse with sage or moonlight"
    },
    soldCount: 892,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Maya S.",
        rating: 5,
        comment: "Beautiful crystals with excellent energy. The guidebook is very helpful!",
        date: "3 days ago",
        verified: true
      }
    ]
  },
  6: {
    id: 6,
    name: "Sleep Sound Machine",
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.8,
    reviews: 1123,
    image: "🌊",
    category: "Sleep",
    description: "White noise machine with 20+ nature sounds and timer",
    longDescription: "Create the perfect sleep environment with our advanced sound machine. Features 20+ high-quality nature sounds including ocean waves, rain, thunder, and white noise. The built-in timer automatically shuts off after your chosen duration, and the compact design makes it perfect for travel.",
    inStock: true,
    badge: "Popular",
    colors: ["White", "Black", "Wood"],
    sizes: ["Standard"],
    features: [
      "20+ Nature Sounds",
      "Timer Function",
      "Volume Control",
      "Compact Design",
      "AC/DC Power Options"
    ],
    specifications: {
      "Sounds": "20+ nature sounds",
      "Timer": "15, 30, 60, 90 minutes",
      "Power": "AC adapter or 3 AA batteries",
      "Dimensions": "6\" x 4\" x 2\"",
      "Weight": "0.8 lbs"
    },
    soldCount: 1847,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Sarah L.",
        rating: 5,
        comment: "Amazing sound quality! My baby sleeps so much better now.",
        date: "5 days ago",
        verified: true
      },
      {
        id: 2,
        name: "Mike D.",
        rating: 4,
        comment: "Great variety of sounds. The timer feature is very useful.",
        date: "1 week ago",
        verified: true
      }
    ]
  },
  7: {
    id: 7,
    name: "Mindfulness Journal",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.6,
    reviews: 445,
    image: "📔",
    category: "Books",
    description: "365-day guided mindfulness journal with daily prompts",
    longDescription: "Transform your daily routine with our comprehensive mindfulness journal. Each page features thoughtful prompts designed to cultivate gratitude, self-reflection, and inner peace. The beautiful design and high-quality paper make this journal a joy to use every day.",
    inStock: true,
    badge: "Guide",
    colors: ["Sage Green", "Navy Blue", "Cream"],
    sizes: ["Standard (8.5\" x 5.5\")"],
    features: [
      "365 Daily Prompts",
      "High-quality Paper",
      "Lay-flat Binding",
      "Ribbon Bookmark",
      "Inspirational Quotes"
    ],
    specifications: {
      "Pages": "384 pages",
      "Paper": "100gsm cream paper",
      "Binding": "Lay-flat spiral binding",
      "Size": "8.5\" x 5.5\"",
      "Cover": "Hardcover with elastic closure"
    },
    soldCount: 678,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Emma K.",
        rating: 5,
        comment: "Beautiful journal with thoughtful prompts. Perfect for daily reflection.",
        date: "1 week ago",
        verified: true
      }
    ]
  },
  8: {
    id: 8,
    name: "Herbal Tea Collection",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 789,
    image: "🍵",
    category: "Wellness",
    description: "Organic herbal tea collection with 12 calming blends",
    longDescription: "Savor the moment with our premium organic herbal tea collection. Each blend is carefully crafted using the finest organic ingredients to promote relaxation, wellness, and mindfulness. Perfect for morning meditation or evening wind-down routines.",
    inStock: true,
    badge: "Organic",
    colors: ["Mixed"],
    sizes: ["12 Tea Bags", "24 Tea Bags", "48 Tea Bags"],
    features: [
      "100% Organic",
      "12 Unique Blends",
      "Individually Wrapped",
      "Caffeine-free",
      "Sustainably Sourced"
    ],
    specifications: {
      "Blends": "12 herbal tea varieties",
      "Quantity": "12 tea bags per blend",
      "Ingredients": "100% organic herbs",
      "Caffeine": "Caffeine-free",
      "Packaging": "Individually wrapped tea bags"
    },
    soldCount: 1234,
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over $50",
    reviews: [
      {
        id: 1,
        name: "Lisa T.",
        rating: 5,
        comment: "Delicious teas! The chamomile blend is perfect for bedtime.",
        date: "2 days ago",
        verified: true
      },
      {
        id: 2,
        name: "David P.",
        rating: 4,
        comment: "Great variety of flavors. All organic and high quality.",
        date: "1 week ago",
        verified: true
      }
    ]
  }
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    const productData = PRODUCTS_DATA[id];
    if (productData) {
      setProduct(productData);
      setSelectedColor(productData.colors[0]);
      setSelectedSize(productData.sizes[0]);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="product-not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/shopping')} className="back-btn">
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    // Buy now logic here
    alert(`Proceeding to checkout for ${product.name}!`);
  };

  const getDiscountPercentage = () => {
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  return (
    <div className="product-detail-page">
      <Navbar />
      
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/shopping')} className="breadcrumb-link">
            Shopping
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              {typeof product.image === 'string' && product.image.startsWith('http') ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-photo-large"
                  style={{ width: '100%', height: '320px', objectFit: 'contain', borderRadius: '16px', background: '#fff' }}
                />
              ) : (
                <div className="product-emoji-large">{product.image}</div>
              )}
              {product.badge && (
                <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                  {product.badge}
                </span>
              )}
            </div>
            <div className="image-thumbnails">
              {[0,1,2].map((i) => (
                <div key={i} className={`thumbnail ${i===0 ? 'active' : ''}`}>
                  {typeof product.image === 'string' && product.image.startsWith('http') ? (
                    <img
                      src={product.image}
                      alt={`${product.name} thumbnail ${i+1}`}
                      className="product-photo-thumb"
                      style={{ width: '100%', height: '72px', objectFit: 'contain', borderRadius: '10px', background: '#fff' }}
                    />
                  ) : (
                    <div className="product-emoji-small">{product.image}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviews} reviews)
              </span>
              <span className="sold-count">
                {product.soldCount.toLocaleString()} sold
              </span>
            </div>

            <div className="product-pricing">
              <span className="current-price">${product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original-price">${product.originalPrice}</span>
                  <span className="discount">Save {getDiscountPercentage()}%</span>
                </>
              )}
            </div>

            <div className="product-description">
              <p>{product.longDescription}</p>
            </div>

            {/* Color Selection */}
            <div className="product-options">
              <h3>Color: {selectedColor}</h3>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: getColorValue(color) }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div className="product-options">
                <h3>Size: {selectedSize}</h3>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="product-options">
              <h3>Quantity</h3>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </button>
            </div>

            {/* Product Details */}
            <div className="product-details">
              <div className="detail-item">
                <span className="detail-label">Return Policy:</span>
                <span className="detail-value">{product.returnPolicy}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shipping:</span>
                <span className="detail-value">{product.shipping}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>Features</h3>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <p className="long-description">{product.longDescription}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-content">
                <table className="specifications-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="rating-breakdown">
                    <div className="rating-score">
                      <span className="score">{product.rating}</span>
                      <div className="stars-large">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </div>
                      <span className="total-reviews">{product.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                
                <div className="reviews-list">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.name}</span>
                          {review.verified && <span className="verified-badge">Verified Purchase</span>}
                        </div>
                        <div className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get color values
function getColorValue(color) {
  const colorMap = {
    "Natural Beige": "#F5F5DC",
    "Deep Navy": "#000080",
    "Sage Green": "#9CAF88",
    "Charcoal Gray": "#36454F",
    "White": "#FFFFFF",
    "Black": "#000000",
    "Wood Grain": "#8B4513",
    "Rose Gold": "#E8B4B8",
    "Gray": "#808080",
    "Navy": "#000080"
  };
  return colorMap[color] || "#E5E5E5";
}
