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
      return !!user?._id || !!user?.id;
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
      
      // If there was an error, revert the optimistic update
      if (!response) {
        throw new Error('Failed to update like');
      }
      
      // Update with server response
      setIsLiked(response.liked);
      setLikeCount(response.likeCount);
      onLikeChange(response.liked, response.likeCount);
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : Math.max(0, likeCount - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    small: {
      button: 'p-1',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    medium: {
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    large: {
      button: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const { button: buttonSize, icon: iconSize, text: textSize } = sizes[size] || sizes.medium;

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || !isAuthenticated}
      className={`flex items-center gap-1.5 rounded-full transition-colors ${
        isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-500 hover:text-gray-700'
      } ${buttonSize} ${
        !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
      }`}
      aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
    >
      <svg 
        className={`${iconSize} ${isLiked ? 'fill-current' : 'fill-none'} stroke-current`} 
        viewBox="0 0 24 24" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      
      {showCount && likeCount > 0 && (
        <span className={`${textSize} font-medium`}>
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
