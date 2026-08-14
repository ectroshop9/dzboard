import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, Clock, RefreshCw, Trash2, X 
} from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => { if (!token) navigate('/admin'); }, [token]);

  const getAuthHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const load = () => {
    setLoading(true);
    fetch(`${API}/requests`, { headers: getAuthHeader() }).then(r => r.json())
      .then(data => { if (data.success) setRequests(data.requests || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/requests/${id}`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify({ status }) });
    load();
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    await fetch(`${API}/requests/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    load();
  };

  const filtered = requests.filter(r => activeTab === 'all' || r.status === activeTab);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 120, fontFamily: 'system-ui' }}>
      
      <main style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>طلبات القطع الخاصة</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> {pendingCount} طلب جديد
            </span>
            <button onClick={load} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> تحديث
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
          {[
            { key: 'all', label: `الكل (${requests.length})` },
            { key: 'pending', label: `جديدة (${pendingCount})` },
            { key: 'fulfilled', label: `متوفرة (${requests.filter(r => r.status === 'fulfilled').length})` },
            { key: 'cancelled', label: `ملغاة (${requests.filter(r => r.status === 'cancelled').length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: activeTab === tab.key ? '#2563eb' : '#f1f5f9', color: activeTab === tab.key ? '#fff' : '#475569', whiteSpace: 'nowrap' }}>{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Clock size={28} className="spin" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>لا توجد طلبات</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map(r => (
              <div key={r.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 800 }}>{r.part_name}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700, background: r.status === 'pending' ? '#fef3c7' : r.status === 'fulfilled' ? '#d1fae5' : '#fee2e2', color: r.status === 'pending' ? '#92400e' : r.status === 'fulfilled' ? '#065f46' : '#991b1b' }}>{r.status === 'pending' ? 'جديد' : r.status === 'fulfilled' ? 'متوفر' : 'ملغي'}</span>
                </div>
                
                {/* QR Code */}
                <div style={{ textAlign: 'center', marginBottom: 10, background: '#fafafa', padding: 8, borderRadius: 8 }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=REQ-${r.id}-${r.phone}`}
                    alt={`طلب #${r.id}`}
                    style={{ width: 80, height: 80, borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=REQ-${r.id}-${r.phone}`, '_blank')}
                  />
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
                    امسح للتتبع
                  </div>
                </div>
                
                <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                  <div>👤 {r.customer_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📱 {r.phone}</span><a href={`tel:${r.phone}`} style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>اتصل</a></div>
                  {r.brand && <div>🏷️ {r.brand}</div>}
                  {r.model && <div>📺 {r.model}</div>}
                </div>
                {r.image && <img src={r.image} alt={r.part_name} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }} onClick={() => setPreviewImage(r.image)} />}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'fulfilled')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}><CheckCircle2 size={14} /> توفير</button>
                        <button onClick={() => updateStatus(r.id, 'cancelled')} style={{ color: '#ef4444', border: '1px solid #fee2e2', background: '#fff5f5', padding: '6px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}><XCircle size={14} /> إلغاء</button>
                      </>
                    )}
                    {r.status !== 'pending' && <button onClick={() => updateStatus(r.id, 'pending')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>إعادة لجديد</button>}
                  </div>
                  <button onClick={() => deleteRequest(r.id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', borderRadius: 6, cursor: 'pointer', padding: 8 }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: 8, cursor: 'pointer' }}><X size={24} /></button>
          <img src={previewImage} alt="معاينة" style={{ maxWidth: '90%', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}