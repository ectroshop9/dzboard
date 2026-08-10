import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${API}/requests`)
      .then(r => r.json())
      .then(data => { if (data.success) setRequests(data.requests); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const pending = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>طلبات القطع الخاصة</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
            <Clock size={14} /> {pending} طلب جديد
          </span>
          <button onClick={load} className="btn btn-ghost btn-sm"><RefreshCw size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {requests.map(r => (
          <div key={r.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 800 }}>{r.part_name}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: r.status === 'pending' ? '#fef3c7' : r.status === 'fulfilled' ? '#d1fae5' : '#fee2e2', color: r.status === 'pending' ? '#92400e' : r.status === 'fulfilled' ? '#065f46' : '#991b1b' }}>
                {r.status === 'pending' ? 'جديد' : r.status === 'fulfilled' ? 'متوفر' : 'ملغي'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              <div>👤 {r.customer_name}</div>
              <div>📱 {r.phone}</div>
              {r.brand && <div>🏷️ {r.brand}</div>}
              {r.model && <div>📺 {r.model}</div>}
            </div>
            {r.image && <img src={r.image} alt={r.part_name} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
            
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateStatus(r.id, 'fulfilled')} className="btn btn-primary btn-sm" style={{ flex: 1, gap: 4 }}>
                  <CheckCircle2 size={14} /> توفير
                </button>
                <button onClick={() => updateStatus(r.id, 'cancelled')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444', gap: 4 }}>
                  <XCircle size={14} /> إلغاء
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
