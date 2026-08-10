import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw, Phone, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, fulfilled, cancelled
  const [previewImage, setPreviewImage] = useState(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/requests`)
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
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`${API}/requests/${id}`, { method: 'DELETE' });
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
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '20px 16px', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      
      {/* الهيدر والعنوان */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>طلبات القطع الخاصة</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>متابعة وإدارة الطلبات المخصصة للزبائن</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} /> {pendingCount} طلب جديد
          </span>
          <button onClick={load} className="btn btn-ghost btn-sm" style={{ padding: 8 }} title="تحديث البيانات">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* أزرار الفلترة */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 10, overflowX: 'auto' }}>
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
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === tab.key ? '#3b82f6' : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#475569',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* حالة التحميل */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
          <div>جاري تحميل الطلبات...</div>
        </div>
      ) : filteredRequests.length === 0 ? (
        /* حالة لا توجد طلبات */
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Clock size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, color: '#334155', margin: 0 }}>لا توجد طلبات في القائمة</h3>
        </div>
      ) : (
        /* شبكة البطاقات */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
          {filteredRequests.map(r => (
            <div key={r.id} className="card" style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{r.part_name}</span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap', background: r.status === 'pending' ? '#fef3c7' : r.status === 'fulfilled' ? '#d1fae5' : '#fee2e2', color: r.status === 'pending' ? '#92400e' : r.status === 'fulfilled' ? '#065f46' : '#991b1b' }}>
                    {r.status === 'pending' ? 'جديد' : r.status === 'fulfilled' ? 'متوفر' : 'ملغي'}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>👤 {r.customer_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>📱 {r.phone}</span>
                    <a href={`tel:${r.phone}`} style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Phone size={12} /> اتصل
                    </a>
                  </div>
                  {r.brand && <div>🏷️ <strong>الماركة:</strong> {r.brand}</div>}
                  {r.model && <div>📺 <strong>الموديل:</strong> {r.model}</div>}
                </div>

                {r.image && (
                  <div style={{ position: 'relative', height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 12, cursor: 'pointer', background: '#000' }} onClick={() => setPreviewImage(r.image)}>
                    <img src={r.image} alt={r.part_name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                    <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ImageIcon size={10} /> تكبير
                    </span>
                  </div>
                )}
              </div>

              {/* الأزرار والإجراءات */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'fulfilled')} className="btn btn-primary btn-sm" style={{ flex: 1, gap: 4, background: '#10b981', borderColor: '#10b981', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <CheckCircle2 size={14} /> توفير
                      </button>
                      <button onClick={() => updateStatus(r.id, 'cancelled')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444', gap: 4, border: '1px solid #fee2e2', background: '#fff5f5', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <XCircle size={14} /> إلغاء
                      </button>
                    </>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => updateStatus(r.id, 'pending')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                      إعادة لجديد
                    </button>
                  )}
                </div>

                <button onClick={() => deleteRequest(r.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }} title="حذف الطلب">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox لمعاينة الصورة المكبرة */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={previewImage} alt="معاينة" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain' }} />
            <div style={{ color: '#fff', textAlign: 'center', marginTop: 10, fontSize: 13 }}>انقر في أي مكان للإغلاق</div>
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