import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

export default function VideoPlatform() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedVideos, setLikedVideos] = useState(new Set());

  // Mock data for meditation videos
  // In a real implementation, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockVideos = [
        {
          id: 1,
          title: "Morning Meditation",
          description: "Start your day with a calm and focused mind",
          duration: "10:30",
          thumbnail: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
          category: "Mindfulness"
        },
        {
          id: 2,
          title: "Sleep Relaxation",
          description: "Gentle guidance to help you fall asleep peacefully",
          duration: "15:45",
          thumbnail: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg",
          category: "Sleep"
        },
        {
          id: 3,
          title: "Stress Relief",
          description: "Release tension and find inner peace",
          duration: "12:20",
          thumbnail: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg",
          category: "Stress Relief"
        },
        {
          id: 4,
          title: "Breathing Exercises",
          description: "Simple techniques to calm your nervous system",
          duration: "8:15",
          thumbnail: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
          category: "Breathing"
        },
        {
          id: 5,
          title: "Mindful Walking",
          description: "Connect with nature through mindful movement",
          duration: "18:40",
          thumbnail: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
          category: "Movement"
        },
        {
          id: 6,
          title: "Loving Kindness",
          description: "Cultivate compassion for yourself and others",
          duration: "14:25",
          thumbnail: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg",
          category: "Compassion"
        }
      ];
      setVideos(mockVideos);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVideoClick = (videoId) => {
    // In a real implementation, this would navigate to a video player page
    alert(`Playing video ${videoId}`);
  };

  const toggleLike = (videoId) => {
    setLikedVideos(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(videoId)) {
        newLiked.delete(videoId);
      } else {
        newLiked.add(videoId);
      }
      return newLiked;
    });
  };

  // Filter videos based on search term
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="shopping-page">
      <Navbar />
      <div className="shopping-container">
        <div style={{ margin: "20px 0" }}>
          <button className="chip" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header style={{ marginBottom: "30px", textAlign: "center" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px" }}>
              Meditation & Mindfulness
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
              Guided meditation sessions to help you find peace, reduce stress, and improve focus
            </p>
            
            {/* Search Bar */}
            <div style={{ 
              maxWidth: "500px", 
              margin: "20px auto", 
              position: "relative" 
            }}>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "30px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 1px 3px rgba(59, 130, 246, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              />
              <span style={{ 
                position: "absolute", 
                right: "15px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#94a3b8" 
              }}>
                🔍
              </span>
            </div>
          </header>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading videos...</p>
            </div>
          ) : (
            <div>
              {filteredVideos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <h3>No videos found</h3>
                  <p>Try adjusting your search term</p>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                    gap: "24px",
                    marginTop: "20px"
                  }}
                >
                  {filteredVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div style={{ position: "relative" }} onClick={() => handleVideoClick(video.id)}>
                        <div
                          style={{
                            height: "180px",
                            backgroundImage: `url(${video.thumbnail})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            cursor: "pointer"
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem"
                          }}
                        >
                          {video.duration}
                        </div>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <h3 
                            style={{ 
                              margin: 0, 
                              fontSize: "1.1rem", 
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            onClick={() => handleVideoClick(video.id)}
                          >
                            {video.title}
                          </h3>
                          <span
                            style={{
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              fontSize: "0.75rem",
                              fontWeight: "500"
                            }}
                          >
                            {video.category}
                          </span>
                        </div>
                        <p style={{ margin: "8px 0", color: "#64748b", fontSize: "0.9rem" }}>
                          {video.description}
                        </p>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          marginTop: "12px"
                        }}>
                          <button
                            onClick={() => toggleLike(video.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: likedVideos.has(video.id) ? "#ef4444" : "#94a3b8",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            {likedVideos.has(video.id) ? "❤️" : "🤍"}
                            <span style={{ fontSize: "0.9rem" }}>
                              {likedVideos.has(video.id) ? "Liked" : "Like"}
                            </span>
                          </button>
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                            {Math.floor(Math.random() * 1000)} views
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}