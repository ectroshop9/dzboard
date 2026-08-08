const API_BASE = 'https://dzboard.onrender.com/api';

const getToken = () => localStorage.getItem('dzboard_admin_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

// دالة مساعدة لمعالجة استجابات الطلبات وإرجاع الأخطاء بشكل واضح
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({})); // تجنب الانهيار إذا لم ترجع الـ API صيغة JSON

  if (!response.ok) {
    const errorMsg = data.message || data.error || `خطأ في الاتصال: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  getProducts: (params = {}) => 
    fetch(`${API_BASE}/products?${new URLSearchParams(params)}`).then(handleResponse),
  
  getProduct: (id) => 
    fetch(`${API_BASE}/products/${id}`).then(handleResponse),
  
  createProduct: (data) => 
    fetch(`${API_BASE}/products`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  
  updateProduct: (id, data) => 
    fetch(`${API_BASE}/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  
  deleteProduct: (id) => 
    fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
  
  createOrder: (data) => 
    fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  
  getOrders: () => 
    fetch(`${API_BASE}/orders`, { headers: headers() }).then(handleResponse),
  
  updateOrderStatus: (id, status) => 
    fetch(`${API_BASE}/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handleResponse),
  
  adminLogin: (username, password) => 
    fetch(`${API_BASE}/admin/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ username, password }) 
    }).then(handleResponse),
  
  verifyAdmin: () => 
    fetch(`${API_BASE}/admin/verify`, { headers: headers() }).then(handleResponse),
  
  adminLogout: () => localStorage.removeItem('dzboard_admin_token'),
};