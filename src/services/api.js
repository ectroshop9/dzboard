const API_BASE = '/api';

const headers = () => ({
  'Content-Type': 'application/json',
});

// ✅ fetch مع credentials للكوكيز
const fetchWithCred = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',  // ✅ يرسل الكوكيز
    headers: { ...headers(), ...(options.headers || {}) }
  }).then(r => r.json());
};

export const api = {
  getProducts: (params = {}) => fetchWithCred(`${API_BASE}/products?${new URLSearchParams(params)}`),
  getProduct: (id) => fetchWithCred(`${API_BASE}/products/${id}`),
  createProduct: (data) => fetchWithCred(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchWithCred(`${API_BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => fetchWithCred(`${API_BASE}/products/${id}`, { method: 'DELETE' }),
  createOrder: (data) => fetchWithCred(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => fetchWithCred(`${API_BASE}/orders`),
  updateOrderStatus: (id, status) => fetchWithCred(`${API_BASE}/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  
  adminLogin: (username, password, recaptchaToken = '') => fetchWithCred(`${API_BASE}/admin/login`, { 
    method: 'POST', 
    body: JSON.stringify({ username, password, recaptchaToken }) 
  }),
  
  verifyAdmin: () => fetchWithCred(`${API_BASE}/admin/verify`),
  adminLogout: () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_expires');
    return fetchWithCred(`${API_BASE}/admin/logout`, { method: 'POST' });
  },
};
