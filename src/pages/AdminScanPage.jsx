import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { ChevronLeft, Camera, Search } from 'lucide-react';

export default function AdminScanPage() {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [item, setItem] = useState(null);

  const startScan = () => {
    setScanning(true);
    const scanner = new Html5Qrcode('reader');
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (text) => {
        scanner.stop();
        setScanning(false);
        setResult(text);
        
        // جلب تفاصيل القطعة
        const res = await fetch(`https://dzboard.onrender.com/api/inventory/items?search=${text}`);
        const data = await res.json();
        if (data.success && data.items?.length > 0) {
          setItem(data.items[0]);
        }
      },
      () => {}
    );
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <Link to="/admin/inventory" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /> المخزون</Link>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: 16, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 20 }}>مسح باركود</h2>
        
        {!scanning && !item && (
          <button onClick={startScan} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            <Camera size={20} /> ابدأ المسح
          </button>
        )}

        {scanning && (
          <div>
            <div id="reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }} />
            <p style={{ marginTop: 12 }}>وجه الكاميرا نحو الباركود...</p>
          </div>
        )}

        {item && (
          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <h3 style={{ color: item.status === 'available' ? '#10b981' : '#ef4444' }}>
              {item.status === 'available' ? '✅ متوفر' : '❌ مباع'}
            </h3>
            <p><strong>SKU:</strong> {item.sku}</p>
            <p><strong>المنتج:</strong> {item.name}</p>
            <p><strong>الرف:</strong> {item.shelf}</p>
            <p><strong>الباركود:</strong> {item.barcode}</p>
            
            <button 
              onClick={async () => {
                await fetch(`https://dzboard.onrender.com/api/inventory/items/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: item.status === 'available' ? 'sold' : 'available' }),
                });
                setItem({ ...item, status: item.status === 'available' ? 'sold' : 'available' });
              }}
              className={`btn ${item.status === 'available' ? 'btn-accent' : 'btn-primary'} btn-block`}
              style={{ marginTop: 16 }}
            >
              {item.status === 'available' ? 'تأكيد البيع' : 'إرجاع للمخزون'}
            </button>
            
            <button onClick={() => setItem(null)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>مسح آخر</button>
          </div>
        )}
      </div>
    </div>
  );
}
