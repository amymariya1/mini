import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { getProduct } from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  // Fetch product details by ID
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(id);
        if (data && data.product) {
          setProduct(data.product);
        } else {
          console.error("No product data received");
          navigate("/admin/products");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        navigate("/admin/products");
      }
    }
    fetchProduct();
  }, [id, navigate]);

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
          </div>

          {/* 📦 Product Info */}
          <div className="product-detail-info" style={{ flex: "1 1 60%" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "600" }}>
              {product.name}
            </h1>

            <p style={{ color: "#888", marginTop: "4px" }}>
              Category: <strong>{product.category || "General"}</strong>
            </p>

            <div
              style={{
                marginTop: "10px",
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
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                onClick={() => alert("Added to cart!")}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
