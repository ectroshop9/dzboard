import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Loader2, Key, Copy, CheckCircle } from 'lucide-react';

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

export default function AdminSerialsPage() {
  const navigate = useNavigate();
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/serials/admin/list`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setSerials(data.serials || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const generateSerialCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `DZB-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      const res = await fetch(`${API}/serials/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          serial_code: generateSerialCode(),
          max_downloads: parseInt(maxDownloads) || 1
        })
      });
      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        setMaxDownloads(1);
        loadData();
      } else {
        alert(data.message || 'فشل الإنشاء');
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('خطأ في الاتصال');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا السيريال؟')) return;

    try {
      const res = await fetch(`${API}/serials/admin/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const copySerial = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 100, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>إدارة السيريالات 🔑</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadData} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowForm(!showForm)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> سيريال جديد
            </button>
          </div>
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>إنشاء سيريال جديد</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>عدد التحميلات المسموح *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxDownloads}
                  onChange={e => setMaxDownloads(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 16, boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 15 }}
              >
                {saving ? 'جاري...' : 'إنشاء السيريال'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : serials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#64748b' }}>
            <Key size={40} style={{ marginBottom: 10, color: '#cbd5e1' }} />
            <p>لا توجد سيريالات بعد</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {serials.map(serial => {
              const remaining = serial.max_downloads - serial.used_downloads;
              return (
                <div key={serial.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: 700,
                      background: remaining > 0 ? '#dcfce7' : '#fee2e2',
                      color: remaining > 0 ? '#166534' : '#991b1b'
                    }}>
                      {remaining > 0 ? `متبقي ${remaining}` : 'منتهي'}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {serial.used_downloads} / {serial.max_downloads} تحميل
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', padding: '12px', borderRadius: 8, marginBottom: 10 }}>
                    <code style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1, flex: 1 }}>{serial.serial_code}</code>
                    <button onClick={() => copySerial(serial.serial_code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCode === serial.serial_code ? '#10b981' : '#64748b' }}>
                      {copiedCode === serial.serial_code ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button onClick={() => handleDelete(serial.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
