import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpand, 
  FaHeart, 
  FaEye, 
  FaClock,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaStar,
  FaUser
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { 
  getMeditationVideos, 
  getMeditationVideo, 
  toggleMeditationVideoLike,
  getMeditationCategories 
} from '../services/api';

export default function Meditation() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    featured: false,
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Load meditation videos
  useEffect(() => {
    loadVideos();
    loadCategories();
  }, [filters, currentPage]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.featured && { featured: 'true' })
      };

      const response = await getMeditationVideos(params);
      if (response.success) {
        setVideos(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load meditation videos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getMeditationCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleVideoSelect = async (videoId) => {
    try {
      const response = await getMeditationVideo(videoId);
      if (response.success) {
        setSelectedVideo(response.data);
      }
    } catch (err) {
      console.error('Error loading video details:', err);
    }
  };

  const handleLike = async (videoId) => {
    try {
      await toggleMeditationVideoLike(videoId);
      // Update the video in the list
      setVideos(prev => prev.map(video => 
        video._id === videoId 
          ? { ...video, likes: video.likes || [], isLiked: !video.isLiked }
          : video
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos.filter(video => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return video.title.toLowerCase().includes(searchLower) ||
             video.description.toLowerCase().includes(searchLower) ||
             video.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    }
    return true;
  });

  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    }}>
      <Navbar />
      
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '24px',
        position: 'relative'
      }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em'
            }}>
              Meditation Center
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#cbd5e1',
              margin: '0 0 32px 0',
              maxWidth: '600px',
              margin: '0 auto 32px auto',
              lineHeight: '1.6'
            }}>
              Find peace and mindfulness through guided meditation sessions. 
              Choose from our curated collection of calming videos.
            </p>
            
            {/* Search Bar */}
            <div style={{
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '16px',
                  color: '#64748b',
                  fontSize: '1.1rem',
                  zIndex: 2
                }} />
                <input
                  type="text"
                  placeholder="Search meditation videos..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    borderRadius: '16px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#60a5fa';
                    e.target.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
            justifyContent: 'center'
          }}
        >
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Featured Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: filters.featured ? '#fbbf24' : 'rgba(100, 116, 139, 0.3)',
              background: filters.featured 
                ? 'rgba(251, 191, 36, 0.1)' 
                : 'rgba(15, 23, 42, 0.8)',
              color: filters.featured ? '#fbbf24' : 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            <FaStar />
            Featured Only
          </motion.button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                fontSize: '2rem',
                color: '#60a5fa'
              }}
            >
              <FaSpinner />
            </motion.div>
          </div>
        )}

        {/* Video Grid */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onClick={() => handleVideoSelect(video._id)}
              >
                {/* Video Thumbnail */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: '3rem',
                      color: '#60a5fa',
                      opacity: 0.7
                    }}>
                      🧘‍♀️
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FaPlay style={{ color: 'white', fontSize: '1.2rem', marginLeft: '4px' }} />
                  </div>

                  {/* Duration Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FaClock />
                    {formatDuration(video.duration)}
                  </div>

                  {/* Featured Badge */}
                  {video.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 'bold'
                    }}>
                      <FaStar />
                      Featured
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'white',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {video.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {video.description}
                  </p>

                  {/* Video Stats */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaEye />
                        {video.viewCount || 0}
                      </span>
                      
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaHeart />
                        {video.likes?.length || 0}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.8rem',
                      color: '#60a5fa',
                      background: 'rgba(96, 165, 250, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      textTransform: 'capitalize'
                    }}>
                      {video.difficulty}
                    </span>
                  </div>

                  {/* Category and Tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#a78bfa',
                      background: 'rgba(167, 139, 250, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      textTransform: 'capitalize'
                    }}>
                      {video.category}
                    </span>
                    {video.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        background: 'rgba(100, 116, 139, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Author Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#94a3b8'
                  }}>
                    <FaUser />
                    {video.uploadedBy?.name || 'Admin'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Videos Message */}
        {!loading && filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧘‍♀️</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#cbd5e1' }}>
              No videos found
            </h3>
            <p style={{ fontSize: '1rem' }}>
              Try adjusting your filters or check back later for new content.
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '48px'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                background: pagination.hasPrev 
                  ? 'rgba(15, 23, 42, 0.8)' 
                  : 'rgba(15, 23, 42, 0.4)',
                color: pagination.hasPrev ? 'white' : '#64748b',
                cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              Previous
            </motion.button>

            <span style={{
              padding: '12px 16px',
              color: '#cbd5e1',
              fontSize: '1rem'
            }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                background: pagination.hasNext 
                  ? 'rgba(15, 23, 42, 0.8)' 
                  : 'rgba(15, 23, 42, 0.4)',
                color: pagination.hasNext ? 'white' : '#64748b',
                cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              Next
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
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
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                backdropFilter: 'blur(20px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedVideo(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Video Player */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '400px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                background: '#000'
              }}>
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Video Details */}
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 8px 0'
                }}>
                  {selectedVideo.title}
                </h2>
                
                <p style={{
                  fontSize: '1rem',
                  color: '#cbd5e1',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  {selectedVideo.description}
                </p>

                {/* Video Stats */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaEye />
                    {selectedVideo.viewCount || 0} views
                  </span>
                  
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaHeart />
                    {selectedVideo.likes?.length || 0} likes
                  </span>
                  
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaClock />
                    {formatDuration(selectedVideo.duration)}
                  </span>
                </div>

                {/* Tags */}
                {selectedVideo.tags?.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {selectedVideo.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.8rem',
                        color: '#60a5fa',
                        background: 'rgba(96, 165, 250, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '8px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLike(selectedVideo._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaHeart />
                    Like
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

