import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUpload, 
  FaSpinner,
  FaCheck,
  FaTimes,
  FaPlay,
  FaClock,
  FaHeart,
  FaStar
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { 
  getMeditationVideos, 
  createMeditationVideo, 
  updateMeditationVideo, 
  deleteMeditationVideo 
} from '../services/api';

export default function AdminMeditation() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    category: 'meditation',
    difficulty: 'beginner',
    tags: '',
    featured: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Load videos on mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await getMeditationVideos({ limit: 100 });
      if (response.success) {
        setVideos(response.data);
      }
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.videoUrl) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const videoData = {
        ...formData,
        duration: parseInt(formData.duration),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingVideo) {
        await updateMeditationVideo(editingVideo._id, videoData);
      } else {
        await createMeditationVideo(videoData);
      }

      // Reset form and reload videos
      resetForm();
      await loadVideos();
    } catch (err) {
      console.error('Error saving video:', err);
      setError('Failed to save video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration.toString(),
      category: video.category,
      difficulty: video.difficulty,
      tags: video.tags?.join(', ') || '',
      featured: video.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await deleteMeditationVideo(videoId);
      await loadVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '',
      category: 'meditation',
      difficulty: 'beginner',
      tags: '',
      featured: false
    });
    setEditingVideo(null);
    setShowForm(false);
    setError('');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      <Navbar />
      
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '24px' 
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              margin: '0 0 8px 0',
              color: '#1e293b'
            }}>
              Meditation Video Management
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              margin: 0
            }}>
              Upload and manage meditation videos for your users
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            <FaPlus />
            Add Video
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaTimes />
            {error}
          </motion.div>
        )}

        {/* Video Upload/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 0.8)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: 0,
                  color: '#1e293b'
                }}>
                  {editingVideo ? 'Edit Video' : 'Upload New Video'}
                </h2>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter video title..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Duration (seconds) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 300 for 5 minutes"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the meditation video..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://example.com/video.mp4"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    placeholder="https://example.com/thumbnail.jpg"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="meditation">Meditation</option>
                      <option value="breathing">Breathing</option>
                      <option value="mindfulness">Mindfulness</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="sleep">Sleep</option>
                      <option value="anxiety-relief">Anxiety Relief</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="stress, calm, focus (comma separated)"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="featured" style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaStar />
                    Featured Video
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-end',
                  marginTop: '24px'
                }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetForm}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      background: 'transparent',
                      color: '#6b7280',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: submitting 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: submitting 
                        ? 'none' 
                        : '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {editingVideo ? 'Update Video' : 'Upload Video'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Videos List */}
        {loading ? (
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
                color: '#667eea'
              }}
            >
              <FaSpinner />
            </motion.div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {videos.map((video) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
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
                  
                  {/* Play Button */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FaPlay style={{ color: 'white', fontSize: '1rem', marginLeft: '2px' }} />
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

                  {/* Duration */}
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
                </div>

                {/* Video Info */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    color: '#1e293b',
                    lineHeight: '1.4'
                  }}>
                    {video.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
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
                      color: '#667eea',
                      background: 'rgba(102, 126, 234, 0.1)',
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
                    marginBottom: '16px'
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

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(video)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#374151',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaEdit />
                      Edit
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#374151',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaEye />
                      View
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(video._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#dc2626',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaTrash />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Videos Message */}
        {!loading && videos.length === 0 && (
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
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#1e293b' }}>
              No videos uploaded yet
            </h3>
            <p style={{ fontSize: '1rem' }}>
              Click "Add Video" to upload your first meditation video.
            </p>
          </motion.div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

