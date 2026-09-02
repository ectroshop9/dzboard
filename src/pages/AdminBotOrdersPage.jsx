import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, Loader2, Search, Phone, Package, ArrowRight, Truck, Printer, QrCode } from 'lucide-react';

const API = '/api';

export default function AdminBotOrdersPage() {
  const navigate = useNavigate();
  const tokenData = localStorage.getItem('dzboard_admin_token'); const token = (() => { try { return JSON.parse(tokenData).token; } catch { return tokenData; } })();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creatingShipment, setCreatingShipment] = useState(null);

  useEffect(() => {
    if (!token) navigate('/admin');
    else fetchOrders();
  }, [token]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API}/bot-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bot-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (!confirm('حذف هذا الطلب؟')) return;
    await fetch(`${API}/bot-orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchOrders();
  };

  // إنشاء شحنة DHD
  const createDHDShipment = async (order) => {
    setCreatingShipment(order.id);
    try {
      const res = await fetch(`${API}/shipping/create-shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: order.id,
          customer: order.customer_name,
          phone: order.phone,
          amount: order.price,
          shipping: 0,
          items: [{ name: order.product_name, quantity: 1 }]
        })
      });
      const data = await res.json();
      
      if (data.success && data.tracking) {
        alert(`✅ تم إنشاء الشحنة بنجاح!\nرقم التتبع: ${data.tracking}`);
        fetchOrders();
      } else {
        alert(`❌ فشل إنشاء الشحنة: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      alert('❌ خطأ في الاتصال بـ DHD');
    } finally {
      setCreatingShipment(null);
    }
  };

  // طباعة باركود
  const printBarcode = (order) => {
    const printWindow = window.open('', '_blank', 'width=500,height=500');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>طلب بوت #${order.id}</title>
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
            <div class="title">طلب بوت #${order.id} - ${order.customer_name}</div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOT-ORDER-${order.id}-${order.tracking || 'notrack'}" />
            <div class="code">${order.tracking || 'No tracking'}</div>
            <script>setTimeout(()=>{window.print();window.close()},500)</script>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = orders.filter(o => {
    const matchSearch = (o.customer_name || '').includes(searchQuery) || 
                        (o.phone || '').includes(searchQuery) || 
                        (o.product_name || '').includes(searchQuery);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_MAP = {
    pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#b45309' },
    confirmed: { label: 'مؤكد', bg: '#dbeafe', color: '#1d4ed8' },
    completed: { label: 'مكتمل', bg: '#d1fae5', color: '#047857' },
    cancelled: { label: 'ملغي', bg: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 120, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        {/* الهيدر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin/orders-menu')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>طلبات البوت 🤖</h1>
          </div>
          <button onClick={fetchOrders} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* الفلاتر */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input 
              placeholder="بحث بالاسم، الهاتف، المنتج..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              style={{ width: '100%', padding: '10px 35px 10px 10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
            <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {/* الطلبات */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 12, color: '#64748b' }}>
            <Package size={40} style={{ marginBottom: 10, color: '#cbd5e1' }} />
            <p>لا توجد طلبات من البوت</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map(o => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
              return (
                <div key={o.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong style={{ fontSize: 15 }}>{o.customer_name}</strong>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={14} style={{ color: '#3b82f6' }} />
                      <span dir="ltr">{o.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package size={14} style={{ color: '#f59e0b' }} />
                      <span>{o.product_name}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>💰 {o.price} دج</div>
                    {o.tracking && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f9ff', padding: '6px 10px', borderRadius: 8 }}>
                        <Truck size={14} style={{ color: '#3b82f6' }} />
                        <span style={{ fontWeight: 700, color: '#1d4ed8' }}>تتبع: {o.tracking}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>🕐 {new Date(o.created_at).toLocaleString('ar-DZ')}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10, flexWrap: 'wrap' }}>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ flex: 1, minWidth: 120, padding: '8px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc' }}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    
                    {/* زر إنشاء شحنة DHD */}
                    <button 
                      onClick={() => createDHDShipment(o)} 
                      disabled={creatingShipment === o.id}
                      style={{ 
                        background: '#3b82f6', 
                        border: 'none', 
                        color: '#fff', 
                        borderRadius: 8, 
                        padding: '8px 12px', 
                        cursor: creatingShipment === o.id ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        opacity: creatingShipment === o.id ? 0.6 : 1
                      }}
                    >
                      {creatingShipment === o.id ? <Loader2 size={14} className="spin" /> : <Truck size={14} />}
                      {o.tracking ? 'إعادة شحن' : 'شحن DHD'}
                    </button>
                    
                    {/* زر طباعة باركود */}
                    <button 
                      onClick={() => printBarcode(o)} 
                      style={{ 
                        background: '#f1f5f9', 
                        border: 'none', 
                        borderRadius: 8, 
                        padding: '8px 10px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="طباعة باركود"
                    >
                      <Printer size={14} />
                    </button>
                    
                    {/* زر حذف */}
                    <button 
                      onClick={() => deleteOrder(o.id)} 
                      style={{ 
                        background: '#fee2e2', 
                        border: 'none', 
                        color: '#b91c1c', 
                        borderRadius: 8, 
                        padding: '8px 10px', 
                        cursor: 'pointer' 
                      }}
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}