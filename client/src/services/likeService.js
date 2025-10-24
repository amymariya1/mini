import { likePost, getPost } from './api';

// Toggle like on a post
export const toggleLike = async (postId) => {
  try {
    // Using the imported likePost function
    const response = await likePost(postId);
    return response;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get like status for multiple posts
export const getLikeStatus = async (postIds) => {
  try {
    if (!postIds || postIds.length === 0) return {};
    
    // Since we don't have a direct endpoint for this, we'll fetch each post's like status
    // This is not ideal but works with the existing API
    const status = {};
    for (const postId of postIds) {
      try {
        const post = await getPost(postId);
        status[postId] = {
          liked: post.likedBy?.includes(getCurrentUserId()),
          likeCount: post.likedBy?.length || 0
        };
      } catch (err) {
        console.error(`Error getting like status for post ${postId}:`, err);
        status[postId] = { liked: false, likeCount: 0 };
      }
    }
    return status;
  } catch (error) {
    console.error('Error getting like status:', error);
    return {};
  }
};

// Helper function to get current user ID
function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('mm_user') || '{}');
    return user?._id || user?.id;
  } catch (e) {
    return null;
  }
}

// Get users who liked a post
export const getPostLikes = async (postId, { limit = 20, skip = 0 } = {}) => {
  try {
    // Since we don't have a direct endpoint for this, we'll return basic like info
    const post = await getPost(postId);
    return post.likedBy?.map(userId => ({
      _id: userId,
      user: { _id: userId },
      createdAt: new Date() // Approximate timestamp
    })) || [];
  } catch (error) {
    console.error('Error getting post likes:', error);
    return [];
  }
};
