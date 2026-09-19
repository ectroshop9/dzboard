import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, Save, X, MapPin, Phone, Loader2, Search, ArrowRight } from 'lucide-react';

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
  { id: 49, name: 'تيميمون' }, { id: 50, name: 'برج باجي مختار' }, { id: 51, name: 'أولاد جلال' },
  { id: 52, name: 'بني عباس' }, { id: 53, name: 'عين صالح' }, { id: 54, name: 'عين قزام' },
  { id: 55, name: 'تقرت' }, { id: 56, name: 'جانت' }, { id: 57, name: 'المغير' }, { id: 58, name: 'المنيعة' },
];

const getToken = () => {
  const t = localStorage.getItem('dzboard_admin_token');
  try { return JSON.parse(t).token || t; } catch { return t; }
};

export default function AdminStopdesksPage() {
  const navigate = useNavigate();
  const [stopdesks, setStopdesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWilaya, setFilterWilaya] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ wilaya_id: '', name: '', commune: '', address: '', phone: '' });

  useEffect(() => {
    if (!getToken()) { navigate('/admin'); return; }
    loadData();
  }, []);

  useEffect(() => { loadData(); }, [filterWilaya, searchQuery]);

  const getAuthHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

  const loadData = () => {
    setLoading(true);
    let url = `${API}/stopdesks?`;
    if (filterWilaya) url += `wilaya_id=${filterWilaya}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;
    
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) setStopdesks(d.stopdesks || []);
    }).finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (!formData.wilaya_id || !formData.name) { alert('الولاية والاسم مطلوبان'); return; }
    setSaving(true);
    try {
      const url = editingId ? `${API}/stopdesks/${editingId}` : `${API}/stopdesks`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: getAuthHeader(), body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) {
        setShowForm(false); setEditingId(null);
        setFormData({ wilaya_id: '', name: '', commune: '', address: '', phone: '' });
        loadData();
      } else alert(data.message);
    } catch { alert('خطأ'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المكتب؟')) return;
    await fetch(`${API}/stopdesks/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    loadData();
  };

  const getWilayaName = (id) => WILAYAS.find(w => w.id === id)?.name || `ولاية ${id}`;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'system-ui', paddingBottom: 80 }}>
      <main style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin/dashboard')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>🏢 مكاتب التوصيل</h1>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ wilaya_id: '', name: '', commune: '', address: '', phone: '' }); setShowForm(true); }} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
            <Plus size={16} /> إضافة
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, border: '1px solid #e2e8f0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input placeholder="🔍 بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            <Search size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <select value={filterWilaya} onChange={e => setFilterWilaya(e.target.value)} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, cursor: 'pointer', minWidth: 180, outline: 'none' }}>
            <option value="">🌍 كل الولايات</option>
            {WILAYAS.map(w => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginBottom: 12 }}>
          📊 {stopdesks.length} مكتب
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '2px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{editingId ? 'تعديل مكتب' : 'إضافة مكتب'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <select className="field-input" value={formData.wilaya_id} onChange={e => setFormData({ ...formData, wilaya_id: e.target.value })}>
                <option value="">اختر الولاية *</option>
                {WILAYAS.map(w => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
              </select>
              <input className="field-input" placeholder="اسم المكتب *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input className="field-input" placeholder="البلدية" value={formData.commune} onChange={e => setFormData({ ...formData, commune: e.target.value })} />
              <input className="field-input" placeholder="الهاتف" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ direction: 'ltr', textAlign: 'right' }} />
              <input className="field-input" placeholder="العنوان" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ gridColumn: '1 / -1' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>إلغاء</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={16} /> {saving ? '...' : 'حفظ'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {stopdesks.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{s.wilaya_id}</span>
                      <strong style={{ fontSize: 14 }}>{s.name}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.commune && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} style={{ color: '#f59e0b' }} />{s.commune}</span>}
                      {s.address && <span style={{ fontSize: 11, color: '#64748b' }}>{s.address}</span>}
                      {s.phone && <a href={`tel:${s.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, textDecoration: 'none', direction: 'ltr' }}><Phone size={13} /> {s.phone}</a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-start' }}>
                    <button onClick={() => { setEditingId(s.id); setFormData({ wilaya_id: s.wilaya_id, name: s.name, commune: s.commune || '', address: s.address || '', phone: s.phone || '' }); setShowForm(true); }} style={{ background: '#eff6ff', border: 'none', color: '#2563eb', borderRadius: 6, padding: 8, cursor: 'pointer' }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: 8, cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
