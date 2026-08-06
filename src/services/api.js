const API_BASE = '/api';

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/products?${query}`).then(res => res.json());
  },
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(res => res.json()),
  createProduct: (data, token) => fetch(`${API_BASE}/products`, {
    method: 'POST', headers: headers(token), body: JSON.stringify(data),
  }).then(res => res.json()),
  updateProduct: (id, data, token) => fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT', headers: headers(token), body: JSON.stringify(data),
  }).then(res => res.json()),
  deleteProduct: (id, token) => fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE', headers: headers(token),
  }).then(res => res.json()),
  createOrder: (data) => fetch(`${API_BASE}/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }).then(res => res.json()),
  getOrders: (token) => fetch(`${API_BASE}/orders`, {
    headers: headers(token),
  }).then(res => res.json()),
  updateOrderStatus: (id, status, token) => fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT', headers: headers(token), body: JSON.stringify({ status }),
  }).then(res => res.json()),
  adminLogin: (username, password) => fetch(`${API_BASE}/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
  }).then(res => res.json()),
};
