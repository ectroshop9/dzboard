import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, Trash2, Loader2, ArrowRight, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

const API = '/api';

const getToken = () => {
  const t = localStorage.getItem('dzboard_admin_token');
  try { return JSON.parse(t).token || t; } catch { return t; }
};

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: 'https://dzboard-dz.vercel.app',
    icon: '',
    image: ''
  });

  useEffect(() => {
    if (!getToken()) { navigate('/admin'); return; }
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  });

  const loadData = () => {
    setLoading(true);
    fetch(`${API}/notifications`, { headers: getAuthHeader() })
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.notifications || []); })
      .finally(() => setLoading(false));
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast('العنوان والنص مطلوبان', 'error');
      return;
    }

    if (!confirm(`إرسال الإشعار إلى كل المشتركين؟\n\n${formData.title}\n${formData.body}`)) return;

    setSending(true);
    try {
      const res = await fetch(`${API}/notifications/send`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('✅ تم إرسال الإشعار بنجاح!');
        setFormData({ title: '', body: '', url: 'https://dzboard-dz.vercel.app', icon: '', image: '' });
        loadData();
      } else {
        showToast(data.message || 'فشل الإرسال', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال', 'error');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الإشعار من السجل؟')) return;
    await fetch(`${API}/notifications/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    loadData();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('ar-DZ', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'system-ui', paddingBottom: 80 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontSize: 14, fontWeight: 700
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={22} style={{ color: '#f59e0b' }} /> إدارة الإشعارات
          </h1>
        </div>

        {/* نموذج الإرسال */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            📤 إرسال إشعار جديد
          </h2>

          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>
                العنوان *
              </label>
              <input
                className="field-input"
                placeholder="مثال: عرض خاص 🔥"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>
                النص *
              </label>
              <textarea
                className="field-input"
                placeholder="مثال: خصم 20% على كروت Samsung"
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                rows={3}
                maxLength={200}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>
                الرابط (عند الضغط)
              </label>
              <input
                className="field-input"
                placeholder="https://dzboard-dz.vercel.app"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>
                  أيقونة (اختياري)
                </label>
                <input
                  className="field-input"
                  placeholder="https://..."
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block', color: '#64748b' }}>
                  صورة كبيرة (اختياري)
                </label>
                <input
                  className="field-input"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !formData.title || !formData.body}
              style={{
                background: sending ? '#94a3b8' : '#10b981',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: 14, fontSize: 15, fontWeight: 800,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 8
              }}
            >
              {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
              {sending ? 'جاري الإرسال...' : 'إرسال إلى كل المشتركين'}
            </button>
          </div>
        </div>

        {/* سجل الإشعارات */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
            📜 سجل الإشعارات ({notifications.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <Bell size={40} style={{ color: '#cbd5e1', marginBottom: 10 }} />
              <p style={{ fontWeight: 700, margin: 0 }}>لا توجد إشعارات بعد</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  background: '#f8fafc', borderRadius: 12, padding: 14,
                  border: '1px solid #e2e8f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: '#0f172a' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>
                      {n.body}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span>🗓️ {formatDate(n.created_at)}</span>
                      <span style={{
                        background: n.status === 'sent' ? '#dcfce7' : '#fee2e2',
                        color: n.status === 'sent' ? '#166534' : '#991b1b',
                        padding: '2px 8px', borderRadius: 10, fontWeight: 700
                      }}>
                        {n.status === 'sent' ? '✓ أُرسل' : '✗ فشل'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 8, padding: 8, cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
