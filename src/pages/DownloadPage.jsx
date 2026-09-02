import { useState, useEffect } from 'react';
import { Key, Download, Loader2, CheckCircle, XCircle, Package, Search } from 'lucide-react';

export default function DownloadPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [serialCode, setSerialCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    p.file_url
  );

  const handleDownload = async () => {
    if (!serialCode.trim()) {
      setError('يرجى إدخال السيريال');
      return;
    }
    if (!selectedProduct) {
      setError('اختر منتجاً أولاً');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/serials/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial_code: serialCode.trim(),
          product_id: selectedProduct.id
        })
      });
      const data = await res.json();

      if (data.success && data.file_url) {
        setResult({
          file_name: data.file_name,
          remaining_downloads: data.remaining_downloads
        });
        window.open(data.download_url, '_blank', 'noopener,noreferrer');
      } else {
        setError(data.message || 'فشل التحميل');
      }
    } catch {
      setError('خطأ في التحميل');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', padding: 16, fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, color: '#0f172a' }}>تحميل الملفات</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>اختر المنتج ثم أدخل السيريال</p>
        </div>

        {/* اختيار المنتج */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="text"
              placeholder="🔍 ابحث عن المنتج..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 36px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
            />
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto', display: 'grid', gap: 6 }}>
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: selectedProduct?.id === p.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: selectedProduct?.id === p.id ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <Package size={14} />
                {p.name}
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>لا توجد منتجات قابلة للتحميل</p>
            )}
          </div>
        </div>

        {selectedProduct && (
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: 10, marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={14} /> {selectedProduct.name}
          </div>
        )}

        {/* إدخال السيريال */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <XCircle size={16} /> {error}
            </div>
          )}

          <input
            type="text"
            placeholder="أدخل السيريال: DZB-XXXX-XXXX-XXXX"
            value={serialCode}
            onChange={e => setSerialCode(e.target.value.toUpperCase())}
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 15, outline: 'none', textAlign: 'center', letterSpacing: 2, fontWeight: 700, marginBottom: 12, boxSizing: 'border-box' }}
          />

          <button
            onClick={handleDownload}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
            {loading ? 'جاري التحميل...' : 'تحميل الملف'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <CheckCircle size={32} style={{ color: '#10b981', marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 800, color: '#065f46' }}>تم التحميل بنجاح!</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              {result.file_name} - التحميلات المتبقية: <strong>{result.remaining_downloads}</strong>
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
