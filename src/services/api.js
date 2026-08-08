const API_BASE = '/api';

// Get CSRF token
let csrfToken = null;

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(`${API_BASE}/csrf-token`);
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};

const headers = () => ({
  'Content-Type': 'application/json',
});

const headersWithCsrf = async () => {
  const csrf = await getCsrfToken();
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrf || '',
  };
};

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/products?${query}`).then(res => res.json());
  },
  
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(res => res.json()),
  
  createProduct: async (data) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(res => res.json());
  },
  
  updateProduct: async (id, data) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: hdrs,
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(res => res.json());
  },
  
  deleteProduct: async (id) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: hdrs,
      credentials: 'include',
    }).then(res => res.json());
  },
  
  // Orders
  createOrder: async (data) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(res => res.json());
  },
  
  getOrders: () => fetch(`${API_BASE}/orders`, {
    headers: headers(),
    credentials: 'include',
  }).then(res => res.json()),
  
  updateOrderStatus: async (id, status) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: hdrs,
      body: JSON.stringify({ status }),
      credentials: 'include',
    }).then(res => res.json());
  },
  
  // Admin
  adminLogin: async (username, password) => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    }).then(res => res.json());
  },
  
  verifyAdmin: () => fetch(`${API_BASE}/admin/verify`, {
    headers: headers(),
    credentials: 'include',
  }).then(res => res.json()),
  
  adminLogout: async () => {
    const hdrs = await headersWithCsrf();
    return fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: hdrs,
      credentials: 'include',
    }).then(res => res.json());
  },
};
