import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { getProduct } from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getProduct(id);
        const p = data.product;
        setProduct({
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
          badge: p.badge || '',
          longDescription: p.longDescription || p.description || '',
          colors: p.colors || [],
          sizes: p.sizes || [],
          features: p.features || [],
          specifications: p.specifications || {},
        });
      } catch (err) {
        navigate('/shopping');
      }
    }
    load();
  }, [id, navigate]);

  if (!product) return (
    <div className="shopping-page"><Navbar /><div className="shopping-container"><p>Loading...</p></div></div>
  );

  return (
    <div className="shopping-page">
      <Navbar />
      <div className="shopping-container">
        <div style={{ margin: '20px 0' }}>
          <button className="chip" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="product-detail">
          <div className="product-detail-gallery">
            {typeof product.image === 'string' && product.image.startsWith('http') ? (
              <img src={product.image} alt={product.name} className="product-photo" style={{ width: '100%', borderRadius: 12 }} />
            ) : (
              <div className="product-emoji" style={{ fontSize: 96 }}>{product.image}</div>
            )}
            {product.badge && <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>{product.badge}</span>}
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>
            <div className="product-rating">
              <span className="stars">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="rating-text">{product.rating} ({product.reviews})</span>
            </div>
            <div className="product-pricing">
              <span className="current-price">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="original-price">${product.originalPrice}</span>
              )}
            </div>
            <p className="product-description">{product.description}</p>

            {product.colors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="subtle">Color</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {product.colors.map(c => (
                    <button key={c} className={`chip ${selectedColor === c ? 'active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="subtle">Size</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {product.sizes.map(s => (
                    <button key={s} className={`chip ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)||1))} />
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button className="cta-btn" disabled={!product.inStock}>Add to Cart</button>
            </div>

            {product.longDescription && (
              <div className="card" style={{ marginTop: 16 }}>
                <h3>About this item</h3>
                <p>{product.longDescription}</p>
              </div>
            )}

            {product.features.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Features</h3>
                <ul>
                  {product.features.map((f, i) => (<li key={i}>{f}</li>))}
                </ul>
              </div>
            )}

            {Object.keys(product.specifications).length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Specifications</h3>
                <ul>
                  {Object.entries(product.specifications).map(([k,v]) => (<li key={k}><strong>{k}:</strong> {String(v)}</li>))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
