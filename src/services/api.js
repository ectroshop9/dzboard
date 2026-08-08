const API_BASE = 'https://dzboard.onrender.com/api';

const getToken = () => localStorage.getItem('dzboard_admin_token');

// دالة جلب الهيدرز مع دعم Authorization و CSRF Token
const getHeaders = (csrfToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
};

// معالجة استجابات الطلبات والأخطاء
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `خطأ في الاتصال: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // 1. جلب CSRF Token وحفظ الكوكي الخاصة به في المتصفح
  getCsrfToken: () => 
    fetch(`${API_BASE}/csrf-token`, {
      method: 'GET',
      credentials: 'include', // ضروري جداً لتخزين كوكي _csrf
    }).then(handleResponse),

  // 2. المنتجات (Products)
  getProducts: (params = {}) => 
    fetch(`${API_BASE}/products?${new URLSearchParams(params)}`, {
      credentials: 'include'
    }).then(handleResponse),
  
  getProduct: (id) => 
    fetch(`${API_BASE}/products/${id}`, {
      credentials: 'include'
    }).then(handleResponse),
  
  createProduct: (data, csrfToken = null) => 
    fetch(`${API_BASE}/products`, { 
      method: 'POST', 
      headers: getHeaders(csrfToken), 
      credentials: 'include',
      body: JSON.stringify(data) 
    }).then(handleResponse),
  
  updateProduct: (id, data, csrfToken = null) => 
    fetch(`${API_BASE}/products/${id}`, { 
      method: 'PUT', 
      headers: getHeaders(csrfToken), 
      credentials: 'include',
      body: JSON.stringify(data) 
    }).then(handleResponse),
  
  deleteProduct: (id, csrfToken = null) => 
    fetch(`${API_BASE}/products/${id}`, { 
      method: 'DELETE', 
      headers: getHeaders(csrfToken),
      credentials: 'include'
    }).then(handleResponse),
  
  // 3. الطلبات (Orders)
  createOrder: (data) => 
    fetch(`${API_BASE}/orders`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include',
      body: JSON.stringify(data) 
    }).then(handleResponse),
  
  getOrders: () => 
    fetch(`${API_BASE}/orders`, { 
      headers: getHeaders(), 
      credentials: 'include' 
    }).then(handleResponse),
  
  updateOrderStatus: (id, status, csrfToken = null) => 
    fetch(`${API_BASE}/orders/${id}/status`, { 
      method: 'PUT', 
      headers: getHeaders(csrfToken), 
      credentials: 'include',
      body: JSON.stringify({ status }) 
    }).then(handleResponse),
  
  // 4. تسجيل دخول الأدمن
  adminLogin: (username, password, csrfToken = null) => 
    fetch(`${API_BASE}/admin/login`, { 
      method: 'POST', 
      headers: getHeaders(csrfToken), 
      credentials: 'include', // تتيح للمتصفح حفظ admin_token في الكوكيز
      body: JSON.stringify({ username, password }) 
    }).then(handleResponse),
  
  // 5. التحقق وتسجيل الخروج
  verifyAdmin: () => 
    fetch(`${API_BASE}/admin/verify`, { 
      headers: getHeaders(), 
      credentials: 'include' 
    }).then(handleResponse),
  
  adminLogout: () => {
    localStorage.removeItem('dzboard_admin_token');
    return fetch(`${API_BASE}/admin/logout`, { 
      method: 'POST', 
      headers: getHeaders(), 
      credentials: 'include' 
    }).then(handleResponse).catch(() => ({}));
  },
};