// Recommendations service for suggesting related products
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  try {
    // Only set Content-Type for requests that actually send a body
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };

    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    
    let data;
    if (isJSON) {
      try {
        data = await res.json();
      } catch (parseError) {
        const text = await res.text();
        data = text;
      }
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message = (isJSON && data && data.message) ? data.message : (res.statusText || 'Request failed');
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      const error = new Error('Network error: failed to reach API. Is the server running at ' + baseURL + '?');
      throw error;
    }
    throw err;
  }
}

// Get recommended products based on a product
export async function getRecommendedProducts(productId, limit = 4) {
  // In a real implementation, this would call an API endpoint
  // For now, we'll simulate recommendations by returning products in the same category
  try {
    // This is a placeholder - in a real app, you would have:
    // return request(`/recommendations/product/${productId}?limit=${limit}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty array for now - in a real app, this would return actual recommendations
    return { products: [] };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { products: [] };
  }
}

// Get popular products
export async function getPopularProducts(limit = 8) {
  try {
    // This is a placeholder - in a real app, you would have:
    // return request(`/recommendations/popular?limit=${limit}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty array for now - in a real app, this would return actual popular products
    return { products: [] };
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return { products: [] };
  }
}

// Get recently viewed products
export function getRecentlyViewedProducts(limit = 4) {
  try {
    const raw = localStorage.getItem('mm_recently_viewed');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Return last N products (most recent first)
        return parsed.slice(-limit).reverse();
      }
    }
  } catch (_) {
    // If parsing fails, return empty array
  }
  return [];
}

// Add product to recently viewed
export function addRecentlyViewedProduct(product) {
  try {
    const raw = localStorage.getItem('mm_recently_viewed');
    let recentlyViewed = [];
    
    if (raw) {
      recentlyViewed = JSON.parse(raw);
      if (!Array.isArray(recentlyViewed)) {
        recentlyViewed = [];
      }
    }
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
    
    // Add to beginning
    recentlyViewed.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews
    });
    
    // Keep only last 20 items
    if (recentlyViewed.length > 20) {
      recentlyViewed = recentlyViewed.slice(-20);
    }
    
    localStorage.setItem('mm_recently_viewed', JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Error saving recently viewed product:', error);
  }
}