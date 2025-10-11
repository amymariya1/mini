import { auth } from './firebase';
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
    const data = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      const message = (isJSON && data && data.message) ? data.message : (res.statusText || 'Request failed');
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      // Fetch network error (server down / CORS / DNS / SSL etc.)
      throw new Error('Network error: failed to reach API. Is the server running at ' + baseURL + '?');
    }
    throw err;
  }
}

export async function getHealth() {
  return request('/health');
}

// Journal/Admin/User endpoints use temporary header-based auth.
// Prefer API session stored in localStorage (mm_user). Fallback to Firebase auth currentUser.

function userHeaders() {
  const headers = {};
  const raw = localStorage.getItem('mm_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.email) headers['x-user-email'] = user.email;
      if (user?.id) headers['x-user-id'] = user.id;
    } catch (_) {
      // ignore parse error, fallback below
    }
  }
  if (!headers['x-user-email'] && auth?.currentUser) {
    const fb = auth.currentUser;
    if (fb?.email) headers['x-user-email'] = fb.email;
    if (fb?.uid) headers['x-user-id'] = fb.uid;
  }
  return headers;
}

export async function upsertJournal(date, payload) {
  return request(`/journal/${date}` , {
    method: 'PUT',
    headers: userHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getJournal(date) {
  return request(`/journal/${date}`, { headers: userHeaders() });
}

export async function listJournal(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/journal${query ? `?${query}` : ''}`, { headers: userHeaders() });
}

export async function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// New function for therapist registration
export async function registerTherapist(payload) {
  return request('/auth/register-therapist', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(payload) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Admin API
function adminHeaders() {
  const token = localStorage.getItem('mm_admin_token');
  return token ? { 'x-admin-token': token } : {};
}

export async function adminLogin(payload) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminRegister(payload) {
  return request('/admin/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogout() {
  return request('/admin/logout', {
    method: 'POST',
    headers: adminHeaders(),
  });
}

// Users
export async function adminListUsers() {
  return request('/admin/users', { headers: adminHeaders() });
}
export async function adminGetUser(id) {
  return request(`/admin/users/${id}`, { headers: adminHeaders() });
}
export async function adminUpdateUser(id, payload) {
  return request(`/admin/users/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}
export async function adminToggleUserStatus(id) {
  return request(`/admin/users/${id}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}

// Products (admin)
export async function adminListProducts() {
  return request('/admin/products', { headers: adminHeaders() });
}
export async function adminGetProducts() {
  return request('/admin/products', {
    method: 'GET',
    headers: adminHeaders(),
  });
}

export async function adminCreateProduct(productData) {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("mm_admin_token")}`,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) throw new Error("Failed to create product");
  return await res.json();
}

export async function adminUpdateProduct(id, payload) {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}
export async function adminDeleteProduct(id) {
  return request(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

// Posts (admin)
export async function adminListPosts() {
  return request('/admin/posts', { headers: adminHeaders() });
}
export async function adminGetPost(id) {
  return request(`/admin/posts/${id}`, { headers: adminHeaders() });
}
export async function adminCreatePost(payload) {
  return request('/admin/posts', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}
export async function adminUpdatePost(id, payload) {
  return request(`/admin/posts/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}
export async function adminDeletePost(id) {
  return request(`/admin/posts/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

// Post Moderation (admin)
export async function adminApprovePost(id) {
  return request(`/admin/posts/${id}/approve`, {
    method: 'POST',
    headers: adminHeaders(),
  });
}
export async function adminRejectPost(id, reason = '') {
  return request(`/admin/posts/${id}/reject`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ reason }),
  });
}

// Messages (admin)
export async function adminListMessages(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/messages${query ? `?${query}` : ''}`, { headers: adminHeaders() });
}
export async function adminDeleteMessage(id) {
  return request(`/admin/messages/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// Questions (admin)
export async function adminListQuestions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/questions${query ? `?${query}` : ''}`, { headers: adminHeaders() });
}
export async function adminCreateQuestion(payload) {
  return request('/admin/questions', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload) });
}
export async function adminUpdateQuestion(id, payload) {
  return request(`/admin/questions/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(payload) });
}
export async function adminDeleteQuestion(id) {
  return request(`/admin/questions/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// Pending Therapists (admin)
export async function adminListPendingTherapists() {
  return request('/admin/therapists/pending', { headers: adminHeaders() });
}

export async function adminApproveTherapist(id) {
  return request(`/admin/therapists/${id}/approve`, {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}

// Seed DASS-21 questions into admin question bank
export async function adminSeedDass21Questions() {
  return request('/admin/questions/seed-dass21', { method: 'POST', headers: adminHeaders() });
}

// Public Products
export async function listProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
}
export async function getProduct(id) {
  return request(`/products/${id}`);
}

// Public Posts
export async function listPosts() {
  return request('/posts');
}
export async function getPost(id) {
  return request(`/posts/${id}`);
}

// User's own posts
export async function listMyPosts() {
  return request('/my-posts', { headers: userHeaders() });
}

export async function deleteMyPost(id) {
  return request(`/posts/${id}`, { method: 'DELETE', headers: userHeaders() });
}

// Social interactions on posts
export async function likePost(id) {
  return request(`/posts/${id}/like`, { method: 'POST', headers: userHeaders() });
}

export async function addComment(id, text) {
  return request(`/posts/${id}/comments`, {
    method: 'POST',
    headers: { ...userHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

// Create a user-submitted post (requires user headers)
export async function createUserPost(payload) {
  return request('/posts', { method: 'POST', headers: userHeaders(), body: JSON.stringify(payload) });
}

// Public Messages
export async function listMessages(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/messages${query ? `?${query}` : ''}`);
}
export async function createMessage(payload) {
  return request('/messages', { method: 'POST', body: JSON.stringify(payload) });
}

// ✅ NEW FUNCTION to update stock only
export async function adminUpdateProductStock(id, stock) {
  const res = await fetch(`/api/admin/products/${id}/stock`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("mm_admin_token")}`,
    },
    body: JSON.stringify({ stock }),
  });

  if (!res.ok) throw new Error("Failed to update stock");
  return res.json();
}

export async function createTherapist(data) {
  const token = localStorage.getItem("mm_admin_token");
  const res = await fetch("/api/admin/add-therapist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add therapist");
  return await res.json();
}


// Optional: Call external LLM for richer answers
// Configure via REACT_APP_LLM_API_URL (full URL, e.g., https://your-llm-host/assistant/ask)
export async function askAssistantLLM(payload) {
  const llmUrl = process.env.REACT_APP_LLM_API_URL;
  // If external URL is configured, call it directly; otherwise use backend proxy
  if (llmUrl) {
    try {
      const res = await fetch(llmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      const isJSON = contentType.includes('application/json');
      const data = isJSON ? await res.json() : await res.text();
      if (!res.ok) {
        const message = isJSON && data && data.message ? data.message : (res.statusText || 'LLM request failed');
        throw new Error(message);
      }
      if (isJSON && typeof data === 'object' && data) return data;
      return { answer: String(data || '') };
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Network error: failed to reach LLM API.');
      }
      throw err;
    }
  } else {
    // Backend proxy at /api/assistant/ask
    try {
      const data = await request('/assistant/ask', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // data is expected to be { answer: string }
      return data;
    } catch (err) {
      throw err;
    }
  }
}
