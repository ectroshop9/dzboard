const API_BASE = 'https://dzboard.onrender.com/api';

const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('dzboard_admin_token') && { 
    Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` 
  }),
});

export const api = {
  getProducts: (params = {}) => fetch(`${API_BASE}/products?${new URLSearchParams(params)}`).then(r => r.json()),
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(r => r.json()),
  createProduct: (data) => fetch(`${API_BASE}/products`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  updateProduct: (id, data) => fetch(`${API_BASE}/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteProduct: (id) => fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
  createOrder: (data) => fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  getOrders: () => fetch(`${API_BASE}/orders`, { headers: headers() }).then(r => r.json()),
  updateOrderStatus: (id, status) => fetch(`${API_BASE}/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(r => r.json()),
  
  // ✅ تم التعديل - إضافة recaptchaToken
  adminLogin: (username, password, recaptchaToken = '') => fetch(`${API_BASE}/admin/login`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ username, password, recaptchaToken }) 
  }).then(r => r.json()),
  
  verifyAdmin: () => fetch(`${API_BASE}/admin/verify`, { headers: headers() }).then(r => r.json()),
  adminLogout: () => localStorage.removeItem('dzboard_admin_token'),
};