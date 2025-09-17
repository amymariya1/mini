const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  try {
    const res = await fetch(`${baseURL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
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
  const token = localStorage.getItem('mm_admin_token') || '';
  return { 'x-admin-token': token };
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
export async function adminDeleteUser(id) {
  return request(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

// Products (admin)
export async function adminListProducts() {
  return request('/admin/products', { headers: adminHeaders() });
}
export async function adminGetProduct(id) {
  return request(`/admin/products/${id}`, { headers: adminHeaders() });
}
export async function adminCreateProduct(payload) {
  return request('/admin/products', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
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

// Public Messages
export async function listMessages(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/messages${query ? `?${query}` : ''}`);
}
export async function createMessage(payload) {
  return request('/messages', { method: 'POST', body: JSON.stringify(payload) });
}
