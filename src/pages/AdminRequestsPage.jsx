import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw, Phone, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, fulfilled, cancelled
  const [previewImage, setPreviewImage] = useState(null);

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}`
  });

  const load = () => {
    setLoading(true);
    fetch(`${API}/requests`, { headers: getAuthHeader() })
      .then(r => r.json())
      .then(data => { 
        if (data.success) setRequests(data.requests || []); 
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/requests/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });
      load();
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا الطلب؟')) return;
    try {
      await fetch(`${API}/requests/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      load();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 12px', fontFamily: "'Cairo', system-ui, sans-serif", direction: 'rtl' }}>
      
      {/* الهيدر والعنوان */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#0f172a', margin: 0 }}>طلبات القطع الخاصة</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>متابعة وإدارة الطلبات المخصصة للزبائن</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', smWidth: 'auto', justifyContent: 'space-between' }}>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> {pendingCount} طلب جديد
          </span>
          <button onClick={load} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* أزرار الفلترة - تمرير أفقي مريح للهواتف */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {[
          { key: 'all', label: `الكل (${requests.length})` },
          { key: 'pending', label: `الجديدة (${pendingCount})` },
          { key: 'fulfilled', label: `المتوفرة (${requests.filter(r => r.status === 'fulfilled').length})` },
          { key: 'cancelled', label: `الملغاة (${requests.filter(r => r.status === 'cancelled').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === tab.key ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#475569',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* حالة التحميل */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 10px' }} />
          <div>جاري تحميل الطلبات...</div>
        </div>
      ) : filteredRequests.length === 0 ? (
        /* حالة لا توجد طلبات */
        <div style={{ textAlign: 'center', padding: '50px 16px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Clock size={36} style={{ color: '#94a3b8', marginBottom: 12 }} />
          <h3 style={{ fontSize: 15, color: '#334155', margin: 0 }}>لا توجد طلبات في هذه القائمة</h3>
        </div>
      ) : (
        /* شبكة البطاقات - متجاوبة مع كل الأحجام */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filteredRequests.map(r => (
            <div key={r.id} style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', wordBreak: 'break-word' }}>{r.part_name}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap', background: r.status === 'pending' ? '#fef3c7' : r.status === 'fulfilled' ? '#d1fae5' : '#fee2e2', color: r.status === 'pending' ? '#92400e' : r.status === 'fulfilled' ? '#065f46' : '#991b1b' }}>
                    {r.status === 'pending' ? 'جديد' : r.status === 'fulfilled' ? 'متوفر' : 'ملغي'}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>👤 {r.customer_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ direction: 'ltr' }}>📱 {r.phone}</span>
                    <a href={`tel:${r.phone}`} style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                      <Phone size={12} /> اتصل
                    </a>
                  </div>
                  {r.brand && <div>🏷️ <strong>الماركة:</strong> {r.brand}</div>}
                  {r.model && <div>📺 <strong>الموديل:</strong> {r.model}</div>}
                </div>

                {r.image && (
                  <div style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', marginBottom: 12, cursor: 'pointer', background: '#000' }} onClick={() => setPreviewImage(r.image)}>
                    <img src={r.image} alt={r.part_name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                    <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ImageIcon size={10} /> تكبير الصورة
                    </span>
                  </div>
                )}
              </div>

              {/* الأزرار والإجراءات */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'fulfilled')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#10b981', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <CheckCircle2 size={14} /> توفير
                      </button>
                      <button onClick={() => updateStatus(r.id, 'cancelled')} style={{ color: '#ef4444', border: '1px solid #fee2e2', background: '#fff5f5', padding: '6px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <XCircle size={14} /> إلغاء
                      </button>
                    </>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => updateStatus(r.id, 'pending')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                      إعادة لجديد
                    </button>
                  )}
                </div>

                <button onClick={() => deleteRequest(r.id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', borderRadius: 6, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="حذف الطلب">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox لمعاينة الصورة المكبرة */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: -40, left: 0, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: 6, cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="معاينة" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8, objectFit: 'contain' }} />
            <div style={{ color: '#cbd5e1', textAlign: 'center', marginTop: 12, fontSize: 12 }}>انقر بالخارج أو على الأيقونة للإغلاق</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}