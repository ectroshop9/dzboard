import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Loader2, Search, X, Package, Save, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

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
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      ? <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: 20, fontSize: isMobile ? 10 : 11, fontWeight: 700, whiteSpace: 'nowrap' }}>متوفر</span>
      : <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 20, fontSize: isMobile ? 10 : 11, fontWeight: 700, whiteSpace: 'nowrap' }}>مبيوع</span>;
  };

  const inputStyle = {
    padding: isMobile ? '14px' : '12px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    fontSize: isMobile ? 16 : 14,
    width: '100%',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: isMobile ? 13 : 12,
    fontWeight: 700,
    color: '#64748b',
    marginBottom: 6,
    display: 'block'
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: isMobile ? 80 : 100, fontFamily: 'system-ui' }}>
      <main style={{ padding: isMobile ? 10 : 16, maxWidth: 1000, margin: '0 auto' }}>
        
        {/* الهيدر */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10
        }}>
          <h1 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, margin: 0 }}>📦 مخزون الشاشات</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={loadData} 
              style={{ 
                background: '#f1f5f9', 
                border: 'none', 
                borderRadius: 8, 
                padding: isMobile ? '10px 12px' : '8px 12px', 
                cursor: 'pointer',
                minWidth: isMobile ? 44 : 'auto',
                minHeight: isMobile ? 44 : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="تحديث"
            >
              <RefreshCw size={isMobile ? 18 : 16} />
            </button>
            <button 
              onClick={() => setShowForm(!showForm)} 
              style={{ 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: isMobile ? '10px 14px' : '8px 16px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                fontSize: isMobile ? 13 : 13, 
                fontWeight: 700,
                minHeight: isMobile ? 44 : 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={isMobile ? 18 : 16} /> إضافة قطعة
            </button>
          </div>
        </div>

        {/* الفورم */}
        {showForm && (
          <div style={{ 
            background: '#fff', 
            border: '1px solid #3b82f6', 
            borderRadius: 14, 
            padding: isMobile ? 14 : 20, 
            marginBottom: 20,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, margin: 0 }}>إضافة قطعة جديدة</h3>
              <button 
                onClick={() => setShowForm(false)} 
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: 6, 
                  cursor: 'pointer',
                  minWidth: isMobile ? 40 : 'auto',
                  minHeight: isMobile ? 40 : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={isMobile ? 18 : 16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: isMobile ? 14 : 12 }}>
              
              {/* المعلومات الأساسية */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 12 : 10 }}>
                <div>
                  <label style={labelStyle}>الماركة *</label>
                  <input 
                    placeholder="مثال: Samsung" 
                    value={formData.marque} 
                    onChange={e => setFormData({...formData, marque: e.target.value})} 
                    style={inputStyle} 
                    required 
                  />
                </div>
                <div>
                  <label style={labelStyle}>الموديل</label>
                  <input 
                    placeholder="مثال: UA55" 
                    value={formData.modele} 
                    onChange={e => setFormData({...formData, modele: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>رقم الكارت مير *</label>
                  <input 
                    placeholder="BN94-XXXXX" 
                    value={formData.carte_mere} 
                    onChange={e => setFormData({...formData, carte_mere: e.target.value})} 
                    style={inputStyle} 
                    required 
                  />
                </div>
                <div>
                  <label style={labelStyle}>رقم الدال</label>
                  <input 
                    placeholder="CY-X55XXXX" 
                    value={formData.dalle} 
                    onChange={e => setFormData({...formData, dalle: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              {/* رفع الصور */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap: isMobile ? 14 : 12,
                marginTop: 4
              }}>
                <ImageUploader 
                  label="📸 صورة الكرت مير" 
                  value={formData.image_carte} 
                  onChange={url => setFormData({...formData, image_carte: url})} 
                  placeholder="ارفع صورة الكرت مير" 
                />
                <ImageUploader 
                  label="📸 صورة التيكون" 
                  value={formData.image_tcon} 
                  onChange={url => setFormData({...formData, image_tcon: url})} 
                  placeholder="ارفع صورة التيكون" 
                />
                <ImageUploader 
                  label="📸 صورة اليمونتاسيون" 
                  value={formData.image_alimentation} 
                  onChange={url => setFormData({...formData, image_alimentation: url})} 
                  placeholder="ارفع صورة اليمونتاسيون" 
                />
                <ImageUploader 
                  label="📸 صورة درايفر لاد" 
                  value={formData.image_driver_led} 
                  onChange={url => setFormData({...formData, image_driver_led: url})} 
                  placeholder="ارفع صورة درايفر لاد" 
                />
              </div>

              {/* الحالات */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                gap: isMobile ? 12 : 10,
                marginTop: 4
              }}>
                <div>
                  <label style={labelStyle}>حالة الكرت مير</label>
                  <select 
                    value={formData.etat_carte} 
                    onChange={e => setFormData({...formData, etat_carte: e.target.value})} 
                    style={inputStyle}
                  >
                    <option value="available">✅ متوفر</option>
                    <option value="sold">❌ مبيوع</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>حالة الليدات</label>
                  <select 
                    value={formData.etat_led} 
                    onChange={e => setFormData({...formData, etat_led: e.target.value})} 
                    style={inputStyle}
                  >
                    <option value="available">✅ متوفر</option>
                    <option value="sold">❌ مبيوع</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>حالة التيكون</label>
                  <select 
                    value={formData.etat_tcon} 
                    onChange={e => setFormData({...formData, etat_tcon: e.target.value})} 
                    style={inputStyle}
                  >
                    <option value="available">✅ متوفر</option>
                    <option value="sold">❌ مبيوع</option>
                  </select>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={labelStyle}>📦 رقم العلبة</label>
                  <input 
                    placeholder="مثال: Box-001" 
                    value={formData.box} 
                    onChange={e => setFormData({...formData, box: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                style={{ 
                  padding: isMobile ? 16 : 14, 
                  background: '#2563eb', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 10, 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  fontSize: isMobile ? 16 : 15,
                  marginTop: 6,
                  minHeight: isMobile ? 50 : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Save size={isMobile ? 18 : 16} />
                {saving ? 'جاري الحفظ...' : 'حفظ القطعة'}
              </button>
            </form>
          </div>
        )}

        {/* البحث */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 14, 
          padding: isMobile ? 10 : 14, 
          marginBottom: 16,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="🔍 ابحث بالماركة، رقم الكارت مير، رقم الدال..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '14px 40px' : '12px 35px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: isMobile ? 16 : 14,
                boxSizing: 'border-box',
                outline: 'none',
                WebkitAppearance: 'none'
              }}
            />
            <Search size={isMobile ? 18 : 16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {/* عرض العناصر */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={isMobile ? 36 : 32} className="spin" style={{ color: '#2563eb' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 40 : 60,
            background: '#fff',
            borderRadius: 14,
            border: '1px dashed #cbd5e1'
          }}>
            <Package size={isMobile ? 40 : 48} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: isMobile ? 14 : 15, fontWeight: 600, margin: 0 }}>
              {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد قطع في المخزون'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: isMobile ? 10 : 12 }}>
            {filtered.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  background: '#fff', 
                  borderRadius: 14, 
                  padding: isMobile ? 12 : 16, 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* رأس البطاقة */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 10,
                  gap: 8,
                  flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: isMobile ? 15 : 16, display: 'block', marginBottom: 4 }}>
                      {item.marque} {item.modele}
                    </strong>
                    <div style={{ fontSize: isMobile ? 12 : 12, color: '#64748b', marginTop: 2, wordBreak: 'break-word' }}>
                      <span style={{ display: 'inline-block', marginLeft: 8 }}>🔧 {item.carte_mere}</span>
                      {item.dalle && <span style={{ display: 'inline-block', marginLeft: 8 }}>📺 {item.dalle}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    style={{ 
                      background: '#fee2e2', 
                      border: 'none', 
                      color: '#b91c1c', 
                      borderRadius: 6, 
                      padding: isMobile ? '10px' : '6px 10px', 
                      cursor: 'pointer',
                      minWidth: isMobile ? 44 : 'auto',
                      minHeight: isMobile ? 44 : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'flex-start'
                    }}
                    title="حذف"
                  >
                    <Trash2 size={isMobile ? 18 : 14} />
                  </button>
                </div>

                {/* الصور */}
                {(item.image_carte || item.image_tcon || item.image_alimentation || item.image_driver_led) && (
                  <div style={{ 
                    display: 'flex', 
                    gap: 8, 
                    flexWrap: 'wrap',
                    marginBottom: 10
                  }}>
                    {item.image_carte && (
                      <img 
                        src={item.image_carte} 
                        alt="كرت" 
                        style={{ 
                          width: isMobile ? 55 : 60, 
                          height: isMobile ? 55 : 60, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid #e2e8f0'
                        }}
                        onClick={() => setZoomedImage(item.image_carte)}
                        onPointerUp={() => setZoomedImage(item.image_carte)}
                      />
                    )}
                    {item.image_tcon && (
                      <img 
                        src={item.image_tcon} 
                        alt="تيكون" 
                        style={{ 
                          width: isMobile ? 55 : 60, 
                          height: isMobile ? 55 : 60, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid #e2e8f0'
                        }}
                        onClick={() => setZoomedImage(item.image_tcon)}
                        onPointerUp={() => setZoomedImage(item.image_tcon)}
                      />
                    )}
                    {item.image_alimentation && (
                      <img 
                        src={item.image_alimentation} 
                        alt="يمونتاسيون" 
                        style={{ 
                          width: isMobile ? 55 : 60, 
                          height: isMobile ? 55 : 60, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid #e2e8f0'
                        }}
                        onClick={() => setZoomedImage(item.image_alimentation)}
                        onPointerUp={() => setZoomedImage(item.image_alimentation)}
                      />
                    )}
                    {item.image_driver_led && (
                      <img 
                        src={item.image_driver_led} 
                        alt="درايفر" 
                        style={{ 
                          width: isMobile ? 55 : 60, 
                          height: isMobile ? 55 : 60, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid #e2e8f0'
                        }}
                        onClick={() => setZoomedImage(item.image_driver_led)}
                        onPointerUp={() => setZoomedImage(item.image_driver_led)}
                      />
                    )}
                  </div>
                )}

                {/* الحالات */}
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? 6 : 8, 
                  marginTop: 8, 
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  {getBadge(item.etat_carte)}
                  {getBadge(item.etat_led)}
                  {getBadge(item.etat_tcon)}
                  {item.box && (
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#b45309', 
                      padding: '4px 10px', 
                      borderRadius: 20, 
                      fontSize: isMobile ? 10 : 11, 
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>
                      📦 {item.box}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* عداد النتائج */}
        {!loading && filtered.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px', 
            fontSize: isMobile ? 12 : 13,
            color: '#94a3b8',
            fontWeight: 600
          }}>
            {filtered.length} قطعة في المخزون
          </div>
        )}
      </main>

      {/* تكبير الصورة */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)} 
          onPointerUp={() => setZoomedImage(null)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.9)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 20, 
            cursor: 'zoom-out',
            touchAction: 'manipulation'
          }}
        >
          <img 
            src={zoomedImage} 
            alt="تكبير" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '90vh', 
              borderRadius: 16, 
              objectFit: 'contain',
              pointerEvents: 'none'
            }} 
          />
          <button
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            onPointerUp={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 20
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
