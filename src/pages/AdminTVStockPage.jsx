import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Loader2, Search, Camera, X, Package, Save } from 'lucide-react';

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

export default function AdminTVStockPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    carte_mere: '',
    dalle: '',
    image_carte: '',
    image_tcon: '',
    image_alimentation: '',
    image_driver_led: '',
    etat_carte: 'available',
    etat_led: 'available',
    etat_tcon: 'available',
    box: ''
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/admin'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tv-stock`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.marque || !formData.carte_mere) {
      alert('الماركة ورقم الكارت مير مطلوبان');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/tv-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({
          marque: '', modele: '', carte_mere: '', dalle: '',
          image_carte: '', image_tcon: '', image_alimentation: '', image_driver_led: '',
          etat_carte: 'available', etat_led: 'available', etat_tcon: 'available', box: ''
        });
        loadData();
      } else {
        alert(data.message || 'فشل الحفظ');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذه القطعة؟')) return;
    try {
      await fetch(`${API}/tv-stock/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      loadData();
    } catch (err) {
      alert('خطأ');
    }
  };

  const filtered = items.filter(i =>
    (i.marque || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.carte_mere || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.dalle || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadge = (status) => {
    return status === 'available' 
      ? <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>متوفر</span>
      : <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>مبيوع</span>;
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 100, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900 }}>📦 مخزون الشاشات المكسورة</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadData} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowForm(!showForm)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> إضافة قطعة
            </button>
          </div>
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>إضافة قطعة جديدة</h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <input placeholder="الماركة *" value={formData.marque} onChange={e => setFormData({...formData, marque: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} required />
                <input placeholder="الموديل" value={formData.modele} onChange={e => setFormData({...formData, modele: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                <input placeholder="رقم الكارت مير *" value={formData.carte_mere} onChange={e => setFormData({...formData, carte_mere: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} required />
                <input placeholder="رقم الدال" value={formData.dalle} onChange={e => setFormData({...formData, dalle: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <input placeholder="صورة الكرت مير (رابط)" value={formData.image_carte} onChange={e => setFormData({...formData, image_carte: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                <input placeholder="صورة التيكون (رابط)" value={formData.image_tcon} onChange={e => setFormData({...formData, image_tcon: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                <input placeholder="صورة اليمونتاسيون (رابط)" value={formData.image_alimentation} onChange={e => setFormData({...formData, image_alimentation: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                <input placeholder="صورة درايفر لاد (رابط)" value={formData.image_driver_led} onChange={e => setFormData({...formData, image_driver_led: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <select value={formData.etat_carte} onChange={e => setFormData({...formData, etat_carte: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                  <option value="available">الكرت مير: متوفر</option>
                  <option value="sold">الكرت مير: مبيوع</option>
                </select>
                <select value={formData.etat_led} onChange={e => setFormData({...formData, etat_led: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                  <option value="available">الليدات: متوفر</option>
                  <option value="sold">الليدات: مبيوع</option>
                </select>
                <select value={formData.etat_tcon} onChange={e => setFormData({...formData, etat_tcon: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                  <option value="available">التيكون: متوفر</option>
                  <option value="sold">التيكون: مبيوع</option>
                </select>
                <input placeholder="رقم العلبة" value={formData.box} onChange={e => setFormData({...formData, box: e.target.value})} style={{ padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>

              <button type="submit" disabled={saving} style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>
                {saving ? 'جاري...' : 'حفظ القطعة'}
              </button>
            </form>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="🔍 ابحث بالماركة، رقم الكارت مير، رقم الدال..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 35px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
            />
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{item.marque} {item.modele}</strong>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      الكارت: {item.carte_mere} | الدال: {item.dalle}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {item.image_carte && <img src={item.image_carte} alt="كرت" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                  {item.image_tcon && <img src={item.image_tcon} alt="تيكون" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                  {item.image_alimentation && <img src={item.image_alimentation} alt="يمونتاسيون" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                  {item.image_driver_led && <img src={item.image_driver_led} alt="درايفر" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {getBadge(item.etat_carte)}
                  {getBadge(item.etat_led)}
                  {getBadge(item.etat_tcon)}
                  {item.box && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>📦 {item.box}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
