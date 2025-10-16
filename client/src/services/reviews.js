// Reviews service for managing product reviews
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  try {
    console.log(`Reviews API: Making request to ${path}`, options);
    
    // Only set Content-Type for requests that actually send a body
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };

    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
    });
    
    console.log(`Reviews API: Response received from ${path}`, res.status, res.statusText);

    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    console.log(`Reviews API: Content type: ${contentType}, isJSON: ${isJSON}`);
    
    let data;
    if (isJSON) {
      try {
        data = await res.json();
        console.log(`Reviews API: Parsed JSON response data:`, data);
      } catch (parseError) {
        console.error(`Reviews API: Failed to parse JSON response:`, parseError);
        // If JSON parsing fails, try to get text
        const text = await res.text();
        console.log(`Reviews API: Raw response text:`, text);
        data = text;
      }
    } else {
      data = await res.text();
      console.log(`Reviews API: Response text:`, data);
    }

    if (!res.ok) {
      const message = (isJSON && data && data.message) ? data.message : (res.statusText || 'Request failed');
      console.error(`Reviews API: Request failed with status ${res.status}:`, message);
      throw new Error(message);
    }

    console.log(`Reviews API: Request to ${path} successful`);
    return data;
  } catch (err) {
    console.error(`Reviews API: Error making request to ${path}:`, err);
    if (err.name === 'TypeError') {
      // Fetch network error (server down / CORS / DNS / SSL etc.)
      const error = new Error('Network error: failed to reach API. Is the server running at ' + baseURL + '?');
      console.error('Reviews API: Network error detected:', error.message);
      throw error;
    }
    throw err;
  }
}

// Get all reviews for a product
export async function getProductReviews(productId, params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reviews/product/${productId}${query ? `?${query}` : ''}`);
}

// Add a review for a product
export async function addProductReview(productId, reviewData) {
  return request(`/reviews/product/${productId}`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

// Delete a review
export async function deleteProductReview(reviewId) {
  return request(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}