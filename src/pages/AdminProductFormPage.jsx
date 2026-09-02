import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2, Upload, X, CheckCircle, AlertCircle, ArrowRight, Package } from 'lucide-react';

const CATEGORIES = [
  { key: 'tcon', label: 'كرت تيكون', color: '#3b82f6' },
  { key: 'alimentation', label: 'اليمونتاسيون', color: '#f59e0b' },
  { key: 'main-board', label: 'مين بورد', color: '#6366f1' },
  { key: 'parts', label: 'قطع غيار', color: '#10b981' },
];

const API = '/api';

const getToken = () => {
  const tokenData = localStorage.getItem('dzboard_admin_token');
  try {
    const parsed = JSON.parse(tokenData);
    return parsed.token || tokenData;
  } catch {
    return tokenData;
  }
};

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'tcon',
    price: '',
    stock: '1',
    description: '',
    image: '',
    brand: 'generic',
    file_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin');
      return;
    }
    
    if (isEditing) {
      fetch(`${API}/products/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.product) {
            const p = data.product;
            setFormData({
              name: p.name || '',
              category: p.category || 'tcon',
              price: p.price || '',
              stock: p.stock || '1',
              description: p.description || '',
              image: p.image || '',
              brand: p.brand || 'generic',
              file_url: p.file_url || ''
            });
          }
        })
        .catch(() => {});
    }
  }, [id, isEditing]);

  const showToast = (m, t = 'success') => {
    setNotification({ message: m, type: t });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  });

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/products/upload`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ image: reader.result })
        });
        const data = await res.json();
        if (data.success) {
          setFormData(p => ({ ...p, image: data.url }));
          showToast('تم رفع الصورة بنجاح');
        } else {
          showToast('فشل رفع الصورة', 'error');
        }
      } catch {
        showToast('خطأ أثناء رفع الصورة', 'error');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      showToast('الاسم مطلوب', 'error');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('السعر يجب أن يكون رقماً صحيحاً', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category || 'tcon',
        price: priceNum,
        stock: parseInt(formData.stock, 10) || 0,
        image: formData.image || '',
        brand: formData.brand || 'generic',
        description: formData.description || '',
        file_url: formData.file_url || null
      };

      const url = isEditing ? `${API}/products/${id}` : `${API}/inventory/items`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        showToast(isEditing ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح');
        setTimeout(() => navigate('/admin/products'), 1000);
      } else {
        showToast(data.message || 'فشل الحفظ', 'error');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('خطأ أثناء الحفظ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 100, fontFamily: 'system-ui' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      <main style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        {/* الهيدر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => navigate('/admin/products')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isEditing ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>
              {isEditing ? `تعديل المنتج #${id}` : 'أدخل بيانات المنتج الجديد'}
            </p>
          </div>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {/* اسم المنتج */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                اسم المنتج <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                className="field-input"
                placeholder="مثال: Iris 32E3100"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* التصنيف والمخزون */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                  التصنيف <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="field-input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                  المخزون <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* السعر والماركة */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                  السعر (دج) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                  الماركة
                </label>
                <input
                  className="field-input"
                  placeholder="generic"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            {/* رابط الصورة */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                رابط الصورة
              </label>
              <input
                className="field-input"
                placeholder="https://..."
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
              />
              {formData.image && (
                <img src={formData.image} alt="معاينة" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
              )}
            </div>

            {/* رفع صورة */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                رفع صورة جديدة
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px', background: '#f1f5f9', borderRadius: 10, fontWeight: 600, fontSize: 13, border: '2px dashed #cbd5e1' }}>
                <Upload size={16} /> {uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}
                <input type="file" accept="image/*" hidden onChange={e => handleImageUpload(e.target.files[0])} />
              </label>
            </div>

            {/* رابط ملف الفلاش */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                رابط ملف الفلاش (للتحميل بالسيريال)
              </label>
              <input
                className="field-input"
                placeholder="https://..."
                value={formData.file_url}
                onChange={e => setFormData({ ...formData, file_url: e.target.value })}
              />
            </div>

            {/* الوصف */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>
                الوصف
              </label>
              <textarea
                className="field-input"
                placeholder="وصف المنتج..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* الأزرار */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                style={{ flex: 2, padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                {loading ? 'جاري الحفظ...' : isEditing ? 'تحديث المنتج' : 'إضافة المنتج'}
              </button>
            </div>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
