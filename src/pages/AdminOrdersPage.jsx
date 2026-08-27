import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Eye, X, Loader2, Trash2, Printer
} from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#b45309' },
  confirmed: { label: 'مؤكد', bg: '#dbeafe', color: '#1d4ed8' },
  shipped: { label: 'تم الشحن', bg: '#e0e7ff', color: '#4338ca' },
  delivered: { label: 'تم التسليم', bg: '#d1fae5', color: '#047857' },
  cancelled: { label: 'ملغى', bg: '#fee2e2', color: '#b91c1c' },
};

const API = 'https://dzboard2.onrender.com/api';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const tokenData = localStorage.getItem('dzboard_admin_token'); const token = (() => { try { return JSON.parse(tokenData).token; } catch { return tokenData; } })();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { 
    if (!token) navigate('/admin'); 
    else fetchOrders(); 
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      .then(data => { if (data.success || data.orders) setOrders(data.orders || []); })
      .finally(() => setLoading(false));
  };

  const handleStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify({ status }) 
    });
    fetchOrders();
  };

  const handleDelete = async (id) => {
    if (!confirm(`هل أنت متأكد من حذف الطلب #${id} نهائياً؟`)) return;
    
    try {
      const res = await fetch(`${API}/orders/${id}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'فشل الحذف');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('خطأ في الاتصال');
    }
  };

  const handlePrintOrderBarcode = (order) => {
    const printWindow = window.open('', '_blank', 'width=500,height=500');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>طلب #${order.id}</title>
          <style>
            @page{size:auto;margin:0}
            body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fff}
            .card{border:2px dashed #000;padding:16px;text-align:center;border-radius:8px;max-width:280px}
            .title{font-size:16px;font-weight:800;margin-bottom:8px}
            img{width:150px;height:150px}
            .code{font-size:12px;font-family:monospace;margin-top:4px}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">طلب #${order.id} - ${order.customer}</div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER-${order.id}-${order.tracking || 'notrack'}" />
            <div class="code">${order.tracking || 'No tracking'}</div>
            <script>setTimeout(()=>{window.print();window.close()},500)</script>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    const match = (o.customer || '').includes(q) || String(o.id).includes(q) || (o.phone || '').includes(q);
    return match && (statusFilter === 'all' || o.status === statusFilter);
  });

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 120, fontFamily: 'system-ui' }}>
      
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: '#0f172a' }}>إدارة الطلبات</h1>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: 200, flex: 1 }}>
            <input placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="field-input" />
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['all','pending','confirmed','shipped','delivered','cancelled'].map(k => (
              <button 
                key={k} 
                onClick={() => setStatusFilter(k)} 
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: 8, 
                  border: 'none', 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  whiteSpace: 'nowrap', 
                  background: statusFilter === k ? '#2563eb' : '#f1f5f9', 
                  color: statusFilter === k ? '#fff' : '#64748b' 
                }}
              >
                {k === 'all' ? 'الكل' : STATUS_MAP[k]?.label || k}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={32} className="spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', color: '#64748b' }}>
            لا توجد طلبات
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '12px 14px' }}>#</th>
                  <th style={{ padding: '12px 14px' }}>العميل</th>
                  <th style={{ padding: '12px 14px' }}>الهاتف</th>
                  <th style={{ padding: '12px 14px' }}>المبلغ</th>
                  <th style={{ padding: '12px 14px' }}>الحالة</th>
                  <th style={{ padding: '12px 14px' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const st = STATUS_MAP[o.status] || { label: o.status, bg: '#f1f5f9', color: '#475569' };
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>#{o.id}</td>
                      <td style={{ padding: '12px 14px' }}>{o.customer}</td>
                      <td style={{ padding: '12px 14px', direction: 'ltr', textAlign: 'right' }}>{o.phone}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#10b981' }}>
                        {(parseFloat(o.amount||0)+parseFloat(o.shipping||0)).toLocaleString('en-US')} دج
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatus(o.id, e.target.value)}
                          style={{ 
                            padding: '5px 8px', 
                            borderRadius: 6, 
                            border: '1px solid #e2e8f0', 
                            fontSize: 11, 
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: st.bg,
                            color: st.color
                          }}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغى</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button onClick={() => setSelectedOrder(o)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }} title="عرض">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handlePrintOrderBarcode(o)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }} title="طباعة باركود">
                            <Printer size={14} />
                          </button>
                          <button onClick={() => handleDelete(o.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }} title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <h3>طلب #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER-${selectedOrder.id}-${selectedOrder.tracking || 'notrack'}`}
                  alt={`طلب #${selectedOrder.id}`}
                  style={{ width: 150, height: 150, margin: '0 auto' }}
                />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                  امسح الباركود لتتبع الطلب
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}><strong>العميل:</strong> {selectedOrder.customer}</div>
              <div style={{ marginBottom: 12 }}><strong>الهاتف:</strong> {selectedOrder.phone}</div>
              <div style={{ marginBottom: 12 }}><strong>العنوان:</strong> {selectedOrder.address}</div>
              <div style={{ marginBottom: 12 }}><strong>البلدية:</strong> {selectedOrder.commune}</div>
              <div style={{ marginBottom: 12 }}>
                <strong>الإجمالي:</strong> {(parseFloat(selectedOrder.amount||0)+parseFloat(selectedOrder.shipping||0)).toLocaleString('en-US')} دج
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>الحالة:</strong> {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
              </div>
              {selectedOrder.tracking && (
                <div style={{ marginBottom: 12 }}>
                  <strong>رقم التتبع:</strong> {selectedOrder.tracking}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}