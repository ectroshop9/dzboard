import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, Trash2, ArrowRight, MessageSquare } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminChatLogsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate('/admin');
    else fetchLogs();
  }, [token]);

  const fetchLogs = () => {
    setLoading(true);
    fetch(`${API}/chat-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setLogs(data.logs || []);
      })
      .finally(() => setLoading(false));
  };

  const deleteLog = async (id) => {
    if (!confirm('حذف هذه المحادثة؟')) return;
    await fetch(`${API}/chat-logs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLogs();
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 120, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin/orders-menu')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900 }}>محادثات البوت 💬</h1>
          </div>
          <button onClick={fetchLogs} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 12, color: '#64748b' }}>
            <MessageSquare size={40} style={{ marginBottom: 10, color: '#cbd5e1' }} />
            <p>لا توجد محادثات</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {logs.map(log => (
              <div key={log.id} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 10, fontSize: 12, color: '#94a3b8' }}>
                  🕐 {new Date(log.created_at).toLocaleString('ar-DZ')}
                </div>
                <div style={{ background: '#f1f5f9', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                  <strong>👤 العميل:</strong> {log.user_message}
                </div>
                <div style={{ background: '#eff6ff', padding: 10, borderRadius: 8, fontSize: 13 }}>
                  <strong>🤖 البوت:</strong> {log.bot_response}
                </div>
                <button 
                  onClick={() => deleteLog(log.id)}
                  style={{ marginTop: 10, background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                >
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}