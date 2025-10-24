import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { listPosts, listMyPosts, createUserPost, addComment, deleteMyPost } from '../services/api';
import { getLikeStatus } from '../services/likeService';
import LikeButton from '../components/LikeButton';
import { auth } from '../services/firebase';
import { FaSearch, FaFilter, FaSort, FaTimes, FaFire, FaThumbsUp, FaClock } from 'react-icons/fa';

// Helper function to get current user info
function getCurrentUser() {
  try {
    const userRaw = localStorage.getItem('mm_user');
    if (userRaw) {
      return JSON.parse(userRaw);
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  return null;
}

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]); // all approved posts
  const [myPosts, setMyPosts] = useState([]); // current user's posts
  const [likeStatus, setLikeStatus] = useState({}); // { [postId]: { liked: boolean, likeCount: number } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('other'); // 'my', 'other', or 'add'

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [thumbPreview, setThumbPreview] = useState(''); // object URL from file
  const [thumbDataUrl, setThumbDataUrl] = useState(''); // base64 data URL for upload
  const [thumbUrl, setThumbUrl] = useState(''); // direct image URL
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [submitting, setSubmitting] = useState(false);
  const [commentById, setCommentById] = useState({}); // { [postId]: string }
  
  // Notification system
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastPostCount, setLastPostCount] = useState(0);
  
  // Comment viewing
  const [showCommentsFor, setShowCommentsFor] = useState({}); // { [postId]: boolean }
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Calculate user statistics
  const userStats = useMemo(() => {
    return {
      totalPosts: myPosts.length,
      totalLikes: myPosts.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0),
      totalComments: myPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
    };
  }, [myPosts]);
  
  // Helper function to get user data
  const getUserData = (user) => {
    if (!user) return { name: 'User' };
    
    if (typeof user === 'string') {
      try {
        user = JSON.parse(user);
      } catch (e) {
        return { name: 'User' };
      }
    }
    
    return {
      id: user.id || user._id || user.uid,
      name: user.name || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email || '',
      photoURL: user.photoURL || user.avatar
    };
  };

  // Get current user data with fallback to Firebase auth if available
  const currentUser = useMemo(() => {
    try {
      // First try to get from localStorage (API auth)
      const userRaw = localStorage.getItem('mm_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user) return getUserData(user);
      }
      
      // Fallback to Firebase auth
      if (auth?.currentUser) {
        return getUserData(auth.currentUser);
      }
      
      return { name: 'User' }; // Default fallback
    } catch (e) {
      console.error('Error getting user data:', e);
      return { name: 'User' }; // Fallback in case of error
    }
  }, []);
  
  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set();
    [...posts, ...myPosts].forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => tag && tags.add(tag.trim()));
      }
    });
    return Array.from(tags).sort();
  }, [posts, myPosts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return posts.filter(post => {
      // Search by title, content, or author name
      const matchesSearch = !query || 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.author?.name && post.author.name.toLowerCase().includes(query));
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        (post.tags && selectedTags.every(tag => post.tags.includes(tag)));
      
      return matchesSearch && matchesTags;
    });
  }, [posts, searchQuery, selectedTags]);

  // Sort posts based on selected option
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'likes':
          return (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
        case 'trending':
          // Simple trending algorithm: likes per day since creation
          const aAge = (Date.now() - new Date(a.createdAt || 0)) / (1000 * 60 * 60 * 24);
          const bAge = (Date.now() - new Date(b.createdAt || 0)) / (1000 * 60 * 60 * 24);
          const aScore = (a.likedBy?.length || 0) / Math.max(1, aAge);
          const bScore = (b.likedBy?.length || 0) / Math.max(1, bAge);
          return bScore - aScore;
        default:
          return 0;
      }
    });
  }, [filteredPosts, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedTags, sortBy, setSearchParams]);

  // Initialize from URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    const tags = searchParams.get('tags');
    const sort = searchParams.get('sort');
    
    if (q) setSearchQuery(q);
    if (tags) setSelectedTags(tags.split(','));
    if (sort) setSortBy(sort);
  }, [searchParams]);

  // Load posts on mount
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const [postsResponse, myPostsResponse] = await Promise.all([
          listPosts(),
          listMyPosts()
        ]);
        
        const allPosts = [...(postsResponse.posts || []), ...(myPostsResponse.posts || [])];
        const postIds = allPosts.map(p => p._id || p.id).filter(Boolean);
        
        // Fetch like status for all posts
        let likeStatus = {};
        if (postIds.length > 0) {
          likeStatus = await getLikeStatus(postIds);
        }
        
        setPosts(postsResponse.posts || []);
        setMyPosts(myPostsResponse.posts || []);
        setLikeStatus(likeStatus);
        
        // Check for new posts for notifications
        const totalPosts = (postsResponse.posts || []).length + (myPostsResponse.posts || []).length;
        if (totalPosts > lastPostCount && lastPostCount > 0) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'new_post',
            message: 'New posts available!',
            timestamp: new Date(),
            read: false
          }]);
        }
        setLastPostCount(totalPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, [lastPostCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const postData = {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        coverImage: thumbDataUrl || thumbUrl || ''
      };
      
      console.log('Submitting post with data:', {
        ...postData,
        coverImage: postData.coverImage ? 'Image data present' : 'No image data'
      });

      await createUserPost(postData);
      
      // Reset form
      setForm({ title: '', content: '', tags: '' });
      setThumbPreview('');
      setThumbDataUrl('');
      setThumbUrl('');
      
      // Refresh posts
      const [postsResponse, myPostsResponse] = await Promise.all([
        listPosts(),
        listMyPosts()
      ]);
      setPosts(postsResponse.posts || []);
      setMyPosts(myPostsResponse.posts || []);
      
      setActiveView('my');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThumbUrlChange = (e) => {
    setThumbUrl(e.target.value);
    setThumbPreview(e.target.value);
    setSelectedFile(null); // Clear file selection when URL is used
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setThumbPreview(previewUrl);
  };

  // Handle like status update
  const handleLikeChange = (postId, liked, likeCount) => {
    setLikeStatus(prev => ({
      ...prev,
      [postId]: { liked, likeCount }
    }));
    
    // Update the local post data if needed
    const updatePostLikes = (post) => {
      if ((post._id === postId || post.id === postId)) {
        return {
          ...post,
          likeCount,
          likedBy: liked 
            ? [...(post.likedBy || []), getCurrentUser()?.id].filter(Boolean)
            : (post.likedBy || []).filter(id => id !== getCurrentUser()?.id)
        };
      }
      return post;
    };
    
    setPosts(prev => prev.map(updatePostLikes));
    setMyPosts(prev => prev.map(updatePostLikes));
  };

  // Handle like post
  const handleLike = async (postId) => {
    try {
      const currentStatus = likeStatus[postId] || { liked: false, likeCount: 0 };
      const newLiked = !currentStatus.liked;
      const newLikeCount = newLiked ? currentStatus.likeCount + 1 : Math.max(0, currentStatus.likeCount - 1);
      
      // Optimistic update
      handleLikeChange(postId, newLiked, newLikeCount);
      
      // Call the API
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      const data = await response.json();
      // Final update with server data
      handleLikeChange(postId, data.liked, data.likeCount);
      
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const currentStatus = likeStatus[postId] || { liked: false, likeCount: 0 };
      handleLikeChange(postId, !currentStatus.liked, currentStatus.likeCount);
    }
  };


  const handleAddComment = async (postId) => {
    const comment = commentById[postId];
    if (!comment?.trim()) return;

    try {
      await addComment(postId, comment.trim());
      
      // Update posts with new comment
      const newComment = {
        author: { name: 'You' },
        text: comment.trim(),
        createdAt: new Date()
      };
      
      setPosts(prev => prev.map(p => 
        p._id === postId || p.id === postId 
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      ));
      setMyPosts(prev => prev.map(p => 
        p._id === postId || p.id === postId 
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      ));
      
      setCommentById(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const others = sortedPosts;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
          <div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.025em'
              }}>
                Blog Center
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#64748b', 
                margin: '8px 0 0 0',
                fontWeight: 500
              }}>
                Share insights, connect with the community, and discover wellness content
              </p>
          </div>
          
          {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                🔔
              {notifications.filter(n => !n.read).length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                  {notifications.filter(n => !n.read).length}
                  </div>
              )}
            </motion.button>

              {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                    top: '100%',
                  right: 0,
                    marginTop: '8px',
                  background: 'white',
                  borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e5e7eb',
                    minWidth: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}
              >
                {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                      No notifications
                  </div>
                ) : (
                  <div>
                      {notifications.map((notif) => (
                      <motion.div
                          key={notif.id}
                          whileHover={{ backgroundColor: '#f8fafc' }}
                          style={{
                            padding: '16px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer'
                          }}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => 
                            n.id === notif.id ? { ...n, read: true } : n
                          ));
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                                {notif.message}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              by {notif.author}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          {!notif.read && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#3b82f6',
                              marginTop: '6px'
                            }} />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            </div>
          </div>
        </header>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 24,
              border: '1px solid #fecaca',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '280px 1fr', 
          gap: 32, 
          alignItems: 'start',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Left: Professional Side Navigation */}
          <nav style={{ 
            position: 'sticky', 
            top: 24, 
            height: 'fit-content',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(229, 231, 235, 0.8)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                📝
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#1e293b',
                letterSpacing: '-0.025em'
              }}>
                Blog Center
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <motion.button
                type="button"
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('my')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeView === 'my' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: activeView === 'my' ? 'white' : '#475569',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeView === 'my' 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : 'none'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>📝</span>
                <span>My Posts</span>
                {activeView === 'my' && (
                  <div style={{ 
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }} />
                )}
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('other')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeView === 'other' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: activeView === 'other' ? 'white' : '#475569',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeView === 'other' 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : 'none'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🌐</span>
                <span>Community</span>
                {activeView === 'other' && (
                  <div style={{ 
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }} />
                )}
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('add')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeView === 'add' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: activeView === 'add' ? 'white' : '#475569',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeView === 'add' 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : 'none'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>✍️</span>
                <span>Write Post</span>
                {activeView === 'add' && (
                  <div style={{ 
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }} />
                )}
              </motion.button>
              
              {/* My Profile Button */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <motion.button
                  type="button"
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfile(!showProfile)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: showProfile 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    color: showProfile ? 'white' : '#475569',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                    marginBottom: showProfile ? '16px' : 0
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>👤</span>
                  <span>My Profile</span>
                  <span style={{ 
                    marginLeft: 'auto',
                    transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>▼</span>
                </motion.button>
                
                {showProfile && currentUser && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      overflow: 'hidden',
                      background: 'rgba(241, 245, 249, 0.5)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}>
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 600, 
                          color: '#1e293b',
                          textTransform: 'capitalize',
                          fontSize: '1.1rem',
                          marginBottom: '4px'
                        }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {currentUser.email || ''}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      textAlign: 'center',
                      marginTop: '12px'
                    }}>
                      <div>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '1.2rem',
                          color: '#4f46e5',
                          marginBottom: '4px'
                        }}>
                          {userStats.totalPosts}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Posts</div>
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '1.2rem',
                          color: '#4f46e5',
                          marginBottom: '4px'
                        }}>
                          {userStats.totalLikes}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Likes</div>
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '1.2rem',
                          color: '#4f46e5',
                          marginBottom: '4px'
                        }}>
                          {userStats.totalComments}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Comments</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </nav>

          {/* Center: Professional Content Area */}
          <div style={{ 
            display: 'grid', 
            gap: 24,
            width: '100%'
          }}>
            {/* My Posts View */}
            {activeView === 'my' && (
              <section style={{ 
                minHeight: 400,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)',
                  zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      📝
                    </div>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.8rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        letterSpacing: '-0.025em'
                      }}>
                        My Posts
                      </h3>
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        color: '#64748b', 
                        fontSize: '1rem' 
                      }}>
                        Manage and view your published content
                      </p>
                    </div>
                  </div>
                
                {/* Statistics Section */}
                {!loading && myPosts.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '16px', 
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '4px' }}>Total Posts</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{myPosts.length}</div>
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '4px' }}>Total Likes</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        {myPosts.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0)}
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '4px' }}>Total Comments</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        {myPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}
                      </div>
                    </div>
                  </div>
                )}
                
                {loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b',
                    fontSize: '1.1rem'
                  }}>
                    Loading your posts...
                  </div>
                ) : myPosts.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b',
                    fontSize: '1.1rem'
                  }}>
                    You haven't created any posts yet. Click "Write Post" to get started! ✨
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {myPosts.map((p) => {
                      const id = p._id || p.id;
                      const snippet = String(p.content || '').length > 200
                        ? String(p.content).slice(0, 200) + '…'
                        : String(p.content || '');
                      const thumb = p.thumbnail || p.coverImage || '';
                      return (
                        <motion.article 
                          key={id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                            style={{ 
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                            border: '1px solid rgba(229, 231, 235, 0.8)',
                            borderRadius: '16px', 
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          whileHover={{ 
                            y: -4,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          {/* Post header with user info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#f0f0f0',
                              flexShrink: 0
                            }}>
                              {p.authorInfo?.profilePicture || p.user?.profilePicture || p.author?.profilePicture ? (
                                <img 
                                  src={p.authorInfo?.profilePicture || p.user?.profilePicture || p.author?.profilePicture} 
                                  alt={p.authorInfo?.name || p.user?.name || p.author?.name || 'User'} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  onError={(e) => { 
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.authorInfo?.name || p.user?.name || p.author?.name || 'U') + '&background=random';
                                  }} 
                                />
                              ) : (
                                <div style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}>
                                  {(p.authorInfo?.name || p.user?.name || p.author?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ 
                                fontWeight: 600, 
                                color: '#1e293b',
                                fontSize: '0.95rem',
                                lineHeight: '1.2'
                              }}>
                                {p.authorInfo?.name || p.user?.name || p.author?.name || (p.userId === currentUser?.id ? (currentUser?.name || 'You') : 'User')}
                              </div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#64748b',
                                lineHeight: '1.2'
                              }}>
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                }) : ''}
                              </div>
                            </div>
                          </div>
                          
                          {/* Post content */}
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: '100%', height: 100, borderRadius: 12, overflow: 'hidden', background: '#f7f7f7' }}>
                              {String(thumb).trim() ? (
                                <img alt={p.title} src={String(thumb).trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>No image</div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Link to={`/blog/${id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{p.title}</div>
                                </Link>
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                                      try {
                                        await deleteMyPost(id);
                                        // Remove the deleted post from the UI
                                        setMyPosts(prev => prev.filter(post => (post._id || post.id) !== id));
                                        setPosts(prev => prev.filter(post => (post._id || post.id) !== id));
                                      } catch (err) {
                                        console.error('Error deleting post:', err);
                                        setError('Failed to delete post. Please try again.');
                                      }
                                    }
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                      background: '#fee2e2',
                                    },
                                    marginLeft: '12px'
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                                <LikeButton 
                                  postId={p._id || p.id}
                                  initialLiked={likeStatus[p._id || p.id]?.liked || false}
                                  initialLikeCount={likeStatus[p._id || p.id]?.likeCount || p.likedBy?.length || 0}
                                  size="small"
                                  showCount={true}
                                  onLikeChange={(liked, count) => handleLikeChange(p._id || p.id, liked, count)}
                                />
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  color: '#64748b',
                                  fontSize: '0.85rem',
                                  marginLeft: '12px'
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  {p.comments?.length || 0}
                                </div>
                              </div>
                              <div style={{ color: '#374151', lineHeight: '1.5' }}>{snippet}</div>
                            </div>
                              </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
                </div>
              </section>
            )}

            {/* Other Posts View */}
            {activeView === 'other' && (
              <section style={{ 
                minHeight: 400,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)',
                  zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      🌐
                    </div>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.8rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        letterSpacing: '-0.025em'
                      }}>
                        Community Posts
                      </h3>
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        color: '#64748b', 
                        fontSize: '1rem' 
                      }}>
                        Discover posts from our community members
                      </p>
                    </div>
                  </div>
                {loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b',
                    fontSize: '1.1rem'
                  }}>
                    Loading community posts...
                  </div>
                ) : others.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b',
                    fontSize: '1.1rem'
                  }}>
                    No community posts yet. Be the first to share! 🌟
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {others.map((p) => {
                      const id = p._id || p.id;
                      const snippet = String(p.content || '').length > 200
                        ? String(p.content).slice(0, 200) + '…'
                        : String(p.content || '');
                      const thumb = p.thumbnail || p.coverImage || '';
                      return (
                        <motion.article 
                          key={id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                            style={{ 
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                            border: '1px solid rgba(229, 231, 235, 0.8)',
                            borderRadius: '16px', 
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          whileHover={{ 
                            y: -4,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          {/* Author Info */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12, 
                            marginBottom: 16,
                            padding: '8px 12px',
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc'
                          }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0' }}>
                              {p.authorInfo?.profilePicture || p.user?.profilePicture || p.author?.profilePicture ? (
                                <img 
                                  src={p.authorInfo?.profilePicture || p.user?.profilePicture || p.author?.profilePicture} 
                                  alt={p.authorInfo?.name || p.user?.name || p.author?.name || 'Author'} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  onError={(e) => { 
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.authorInfo?.name || p.user?.name || p.author?.name || 'U') + '&background=random';
                                  }} 
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                                  {(p.authorInfo?.name || p.user?.name || p.author?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600, fontSize: 14, color: '#2563eb' }}>
                                  {p.authorInfo?.name || p.user?.name || p.author?.name || (p.userId === getCurrentUser()?.id ? (getCurrentUser()?.name || 'You') : 'User')}
                                </span>
                              </div>
                              <div className="subtle" style={{ fontSize: 12 }}>
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: '100%', height: 100, borderRadius: 12, overflow: 'hidden', background: '#f7f7f7' }}>
                              {String(thumb).trim() ? (
                                <img alt={p.title} src={String(thumb).trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>No image</div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <Link to={`/blog/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ fontWeight: 700, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{p.title}</div>
                                </Link>
                              <div style={{ color: '#374151', lineHeight: '1.5', marginBottom: 12 }}>{snippet}</div>
                              
                              {/* Action Buttons */}
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleLike(id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#374151',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <span style={{ fontSize: '1.1rem' }}>❤️</span>
                                  <span>{p.likedBy?.length || 0}</span>
                                </motion.button>

                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowCommentsFor(prev => ({ ...prev, [id]: !prev[id] }))}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#374151',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <span style={{ fontSize: '1.1rem' }}>💬</span>
                                  <span>{p.comments?.length || 0}</span>
                                </motion.button>
                              </div>
                                  </div>
                                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
                </div>
              </section>
            )}

            {/* Add Post View */}
            {activeView === 'add' && (
              <section style={{ 
                minHeight: 600,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)',
                  zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    marginBottom: '32px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      ✍️
                    </div>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.8rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        letterSpacing: '-0.025em'
                      }}>
                        Create New Post
                      </h3>
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        color: '#64748b', 
                        fontSize: '1rem' 
                      }}>
                        Share your thoughts with the community
                      </p>
                    </div>
                  </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '1rem', 
                      marginBottom: '8px', 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Post Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter a compelling title for your post..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '1rem', 
                      marginBottom: '8px', 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Post Content
                    </label>
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={handleChange}
                      className="input"
                      rows={8}
                      placeholder="Share your thoughts, experiences, or insights with the community..."
                          style={{
                            width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                        resize: 'vertical',
                        minHeight: '200px',
                        lineHeight: '1.6'
                      }}
                    />
                    </div>
                    
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '1rem', 
                      marginBottom: '8px', 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Tags (Optional)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter tags separated by commas (e.g., wellness, mental-health, tips)"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                        marginBottom: '24px'
                      }}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '1rem', 
                      marginBottom: '12px', 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Featured Image
                    </label>
                    
                    <div style={{ 
                      border: '2px dashed #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.3s ease'
                    }}>
                      {thumbPreview ? (
                        <div>
                          <div style={{ 
                            width: '100%', 
                            maxWidth: '300px', 
                            height: '200px', 
                            margin: '0 auto 16px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid #e5e7eb'
                          }}>
                            <img 
                              src={thumbPreview} 
                              alt="Preview" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }} 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setThumbPreview('');
                                setThumbDataUrl('');
                                setThumbUrl('');
                                setSelectedFile(null);
                                if (document.getElementById('file-upload')) {
                                  document.getElementById('file-upload').value = '';
                                }
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <div style={{ color: '#4b5563', marginBottom: '16px' }}>
                            {selectedFile ? selectedFile.name : 'Image selected'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ 
                            fontSize: '48px',
                            color: '#9ca3af',
                            marginBottom: '12px'
                          }}>
                            📷
                          </div>
                          <p style={{ 
                            fontSize: '1rem',
                            color: '#6b7280',
                            marginBottom: '16px'
                          }}>
                            Drag & drop an image here, or click to select
                          </p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <label
                          htmlFor="file-upload"
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            background: '#f3f4f6',
                            color: '#4b5563',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.2s',
                            display: 'inline-block',
                            textAlign: 'center'
                          }}
                        >
                          {thumbPreview ? 'Change Image' : 'Upload Image'}
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                        
                        {!thumbPreview && (
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={thumbUrl}
                              onChange={handleThumbUrlChange}
                              placeholder="Or paste image URL"
                              style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.9rem',
                                width: '220px',
                                transition: 'all 0.2s'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <p style={{ 
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: '12px 0 0',
                        fontStyle: 'italic'
                      }}>
                        Recommended size: 1200×630px (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '16px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <motion.button
                      type="button"
                      onClick={() => setActiveView('my')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        background: 'transparent',
                        color: '#6b7280',
                        fontSize: '1rem',
                        fontWeight: 600,
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
                        padding: '12px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        background: submitting 
                          ? '#9ca3af' 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: submitting 
                          ? 'none' 
                          : '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {submitting ? 'Publishing...' : 'Publish Post'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </section>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}