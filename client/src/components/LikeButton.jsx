import { useState, useEffect } from 'react';
import { toggleLike } from '../services/likeService';

const LikeButton = ({ 
  postId, 
  initialLiked = false, 
  initialLikeCount = 0,
  size = 'medium',
  showCount = true,
  onLikeChange = () => {}
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  
  const isAuthenticated = () => {
    try {
      const user = JSON.parse(localStorage.getItem('mm_user') || '{}');
      return !!(user?._id || user?.id);
    } catch (e) {
      return false;
    }
  };

  // Update local state when props change
  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      // Optionally: Show login modal or redirect to login
      alert('Please log in to like posts');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const wasLiked = isLiked;
    
    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      const response = await toggleLike(postId);
      
      // Update with server response
      setIsLiked(response.liked);
      setLikeCount(response.likeCount);
      onLikeChange(response.liked, response.likeCount);
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : Math.max(0, likeCount - 1));
      alert('Failed to like post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    small: {
      padding: '4px',
      iconSize: '16px',
      fontSize: '12px'
    },
    medium: {
      padding: '8px',
      iconSize: '20px',
      fontSize: '14px'
    },
    large: {
      padding: '12px',
      iconSize: '24px',
      fontSize: '16px'
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || !isAuthenticated()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeConfig.padding,
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        cursor: (isLoading || !isAuthenticated()) ? 'not-allowed' : 'pointer',
        color: isLiked ? '#ef4444' : '#6b7280',
        opacity: isAuthenticated() ? 1 : 0.5,
        transition: 'color 0.2s ease'
      }}
      aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
    >
      <svg 
        style={{
          width: sizeConfig.iconSize,
          height: sizeConfig.iconSize,
          fill: isLiked ? 'currentColor' : 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        viewBox="0 0 24 24"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      
      {showCount && likeCount > 0 && (
        <span style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: '600'
        }}>
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;