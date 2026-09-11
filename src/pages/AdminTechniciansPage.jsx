import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, Save, X, MapPin, Phone, User, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

const API = '/api';

const WILAYAS = [
  { id: 1, name: 'أدرار' }, { id: 2, name: 'الشلف' }, { id: 3, name: 'الأغواط' },
  { id: 4, name: 'أم البواقي' }, { id: 5, name: 'باتنة' }, { id: 6, name: 'بجاية' },
  { id: 7, name: 'بسكرة' }, { id: 8, name: 'بشار' }, { id: 9, name: 'البليدة' },
  { id: 10, name: 'البويرة' }, { id: 11, name: 'تمنراست' }, { id: 12, name: 'تبسة' },
  { id: 13, name: 'تلمسان' }, { id: 14, name: 'تيارت' }, { id: 15, name: 'تيزي وزو' },
  { id: 16, name: 'الجزائر' }, { id: 17, name: 'الجلفة' }, { id: 18, name: 'جيجل' },
  { id: 19, name: 'سطيف' }, { id: 20, name: 'سعيدة' }, { id: 21, name: 'سكيكدة' },
  { id: 22, name: 'سيدي بلعباس' }, { id: 23, name: 'عنابة' }, { id: 24, name: 'قالمة' },
  { id: 25, name: 'قسنطينة' }, { id: 26, name: 'المدية' }, { id: 27, name: 'مستغانم' },
  { id: 28, name: 'المسيلة' }, { id: 29, name: 'معسكر' }, { id: 30, name: 'ورقلة' },
  { id: 31, name: 'وهران' }, { id: 32, name: 'البيض' }, { id: 33, name: 'إليزي' },
  { id: 34, name: 'برج بوعريريج' }, { id: 35, name: 'بومرداس' }, { id: 36, name: 'الطارف' },
  { id: 37, name: 'تندوف' }, { id: 38, name: 'تيسمسيلت' }, { id: 39, name: 'الوادي' },
  { id: 40, name: 'خنشلة' }, { id: 41, name: 'سوق أهراس' }, { id: 42, name: 'تيبازة' },
  { id: 43, name: 'ميلة' }, { id: 44, name: 'عين الدفلى' }, { id: 45, name: 'النعامة' },
  { id: 46, name: 'عين تموشنت' }, { id: 47, name: 'غرداية' }, { id: 48, name: 'غليزان' },
];

const getToken = () => {
  const tokenData = localStorage.getItem('dzboard_admin_token');
  try {
    const parsed = JSON.parse(tokenData);
    return parsed.token || tokenData;
  } catch {
    return tokenData;
  }
};

export default function AdminTechniciansPage() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const initialForm = {
    name: '',
    phone: '',
    wilaya_id: '',
    commune: '',
    address: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin');
      return;
    }
    loadData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  });

  const loadData = () => {
    setLoading(true);
    fetch(`${API}/technicians`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setTechnicians(data.technicians || []);
      })
      .catch(() => showToast('خطأ في التحميل', 'error'))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      name: t.name || '',
      phone: t.phone || '',
      wilaya_id: t.wilaya_id || '',
      commune: t.commune || '',
      address: t.address || '',
      notes: t.notes || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.wilaya_id) {
      showToast('الاسم والهاتف والولاية مطلوبة', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `${API}/technicians/${editingId}`
        : `${API}/technicians`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingId ? 'تم التحديث' : 'تمت الإضافة');
        setShowForm(false);
        setEditingId(null);
        setFormData(initialForm);
        loadData();
      } else {
        showToast(data.message || 'فشل الحفظ', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المصلح؟')) return;
    try {
      const res = await fetch(`${API}/technicians/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم الحذف');
        loadData();
      }
    } catch (err) {
      showToast('خطأ', 'error');
    }
  };

  const getWilayaName = (id) => WILAYAS.find(w => w.id === id)?.name || `ولاية ${id}`;

  const filtered = technicians.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.phone || '').includes(searchQuery) ||
    (t.commune || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 100, fontFamily: 'system-ui' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontSize: 14, fontWeight: 700
        }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      <main style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900 }}>👨‍🔧 إدارة المصلحين</h1>
          <button
            onClick={handleOpenAdd}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 700
            }}
          >
            <Plus size={16} /> إضافة مصلح
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="🔍 ابحث بالاسم، الهاتف، البلدية..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 40px 12px 14px',
                borderRadius: 10, border: '1px solid #cbd5e1',
                fontSize: 14, boxSizing: 'border-box', outline: 'none'
              }}
            />
            <Search size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {showForm && (
          <div style={{
            background: '#fff', border: '2px solid #3b82f6',
            borderRadius: 14, padding: 20, marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                {editingId ? 'تعديل مصلح' : 'إضافة مصلح جديد'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>الاسم *</label>
                <input
                  className="field-input"
                  placeholder="اسم المصلح"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>الهاتف *</label>
                <input
                  className="field-input"
                  placeholder="06XXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>الولاية *</label>
                <select
                  className="field-input"
                  value={formData.wilaya_id}
                  onChange={e => setFormData({ ...formData, wilaya_id: e.target.value })}
                >
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map(w => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>البلدية</label>
                <input
                  className="field-input"
                  placeholder="البلدية"
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>العنوان</label>
                <input
                  className="field-input"
                  placeholder="العنوان التفصيلي"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>ملاحظات</label>
                <textarea
                  className="field-input"
                  placeholder="مثال: متخصص في التلفزيونات الصينية، ساعات العمل 9-18..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                إلغاء
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={16} /> {saving ? 'جاري...' : 'حفظ'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={32} className="spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px dashed #cbd5e1' }}>
            <User size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontWeight: 700 }}>
              {searchQuery ? 'لا توجد نتائج' : 'لا يوجد مصلحين بعد'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(t => (
              <div key={t.id} style={{
                background: '#fff', borderRadius: 14,
                padding: 16, border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <User size={18} style={{ color: '#3b82f6' }} />
                      <strong style={{ fontSize: 16 }}>{t.name}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} style={{ color: '#10b981' }} />
                        <a href={`tel:${t.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700, direction: 'ltr' }}>{t.phone}</a>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} style={{ color: '#f59e0b' }} />
                        {getWilayaName(t.wilaya_id)} {t.commune && `- ${t.commune}`}
                      </span>
                      {t.address && <span style={{ fontSize: 12, color: '#64748b' }}>📍 {t.address}</span>}
                      {t.notes && (
                        <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: 8, marginTop: 4 }}>
                          📝 {t.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-start' }}>
                    <button onClick={() => handleOpenEdit(t)} style={{ background: '#eff6ff', border: 'none', color: '#2563eb', borderRadius: 6, padding: 8, cursor: 'pointer' }}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: 8, cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
