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

// Admin API
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
  const token = localStorage.getItem('mm_admin_token') || '';
  return request('/admin/logout', {
    method: 'POST',
    headers: { 'x-admin-token': token },
  });
}

export async function adminListUsers() {
  const token = localStorage.getItem('mm_admin_token') || '';
  return request('/admin/users', {
    headers: { 'x-admin-token': token },
  });
}

export async function adminGetUser(id) {
  const token = localStorage.getItem('mm_admin_token') || '';
  return request(`/admin/users/${id}`, {
    headers: { 'x-admin-token': token },
  });
}

export async function adminUpdateUser(id, payload) {
  const token = localStorage.getItem('mm_admin_token') || '';
  return request(`/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'x-admin-token': token },
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteUser(id) {
  const token = localStorage.getItem('mm_admin_token') || '';
  return request(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': token },
  });
}