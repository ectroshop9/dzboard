import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Loader2, Key, Copy, CheckCircle, Search } from 'lucide-react';

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
  const [bulkCount, setBulkCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      const count = parseInt(bulkCount) || 1;
      
      for (let i = 0; i < count; i++) {
        await fetch(`${API}/serials/admin/create`, {
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
      }

      setShowForm(false);
      setMaxDownloads(1);
      setBulkCount(1);
      loadData();
      alert(`تم إنشاء ${count} سيريال بنجاح`);
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

  const filteredSerials = serials.filter(serial => {
    const remaining = serial.max_downloads - serial.used_downloads;
    const matchSearch = serial.serial_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && remaining > 0) ||
      (statusFilter === 'expired' && remaining <= 0);
    return matchSearch && matchStatus;
  });

  const activeCount = serials.filter(s => (s.max_downloads - s.used_downloads) > 0).length;
  const expiredCount = serials.filter(s => (s.max_downloads - s.used_downloads) <= 0).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' });
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

        {/* إحصائيات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{serials.length}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>إجمالي</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>{activeCount}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>نشطة</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>{expiredCount}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>منتهية</div>
          </div>
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>إنشاء سيريالات جديدة</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>عدد السيريالات *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={e => setBulkCount(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 16, boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>عدد التحميلات لكل سيريال *</label>
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
                {saving ? 'جاري...' : `إنشاء ${bulkCount} سيريال`}
              </button>
            </form>
          </div>
        )}

        {/* بحث وفلترة */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input
              placeholder="🔍 بحث بالكود..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 35px 10px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
            />
            <Search size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, cursor: 'pointer' }}
          >
            <option value="all">الكل</option>
            <option value="active">نشطة</option>
            <option value="expired">منتهية</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : filteredSerials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#64748b' }}>
            <Key size={40} style={{ marginBottom: 10, color: '#cbd5e1' }} />
            <p>لا توجد سيريالات</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filteredSerials.map(serial => {
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>📅 {formatDate(serial.created_at)}</span>
                    <button onClick={() => handleDelete(serial.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
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