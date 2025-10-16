// Wishlist service for managing user wishlist
const WISHLIST_KEY = 'mm_wishlist';

// Get wishlist from localStorage
export function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {
    // If parsing fails, return empty array
  }
  return [];
}

// Save wishlist to localStorage
export function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
}

// Add item to wishlist
export function addToWishlist(product) {
  const wishlist = getWishlist();
  const existingItem = wishlist.find(item => item.id === product.id);
  
  if (!existingItem) {
    wishlist.push({
      ...product,
      addedAt: new Date().toISOString()
    });
    saveWishlist(wishlist);
  }
  
  return wishlist;
}

// Remove item from wishlist
export function removeFromWishlist(productId) {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist(updatedWishlist);
  return updatedWishlist;
}

// Check if item is in wishlist
export function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === productId);
}

// Clear wishlist
export function clearWishlist() {
  saveWishlist([]);
  return [];
}