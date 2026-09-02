import { useState } from 'react';
import { Key, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DownloadPage() {
  const [serialCode, setSerialCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!serialCode.trim()) {
      setError('يرجى إدخال السيريال');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/serials/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_code: serialCode.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.serial);
      } else {
        setError(data.message || 'سيريال غير صحيح');
      }
    } catch {
      setError('خطأ في الاتصال');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/serials/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_code: serialCode.trim() })
      });
      const data = await res.json();

      if (data.success && data.file_url) {
        window.open(data.file_url, '_blank', 'noopener,noreferrer');
        setResult(prev => ({
          ...prev,
          remaining_downloads: data.remaining_downloads
        }));
      } else {
        setError(data.message || 'فشل التحميل');
      }
    } catch {
      setError('خطأ في التحميل');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '40px 28px', maxWidth: 450, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        
        <div style={{ background: '#eff6ff', color: '#2563eb', margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Key size={32} />
        </div>
        
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: '#0f172a' }}>تحميل الملفات</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>أدخل السيريال الذي حصلت عليه</p>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="مثال: DZB-1234-5678"
            value={serialCode}
            onChange={e => setSerialCode(e.target.value.toUpperCase())}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15, outline: 'none', textAlign: 'center', letterSpacing: 2, fontWeight: 700 }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Key size={18} />}
            {loading ? 'جاري التحقق...' : 'تحقق من السيريال'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 20, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14, padding: 20 }}>
            <CheckCircle size={32} style={{ color: '#10b981', marginBottom: 10 }} />
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#065f46', marginBottom: 4 }}>السيريال صحيح!</h3>
            
            {result.product_name && (
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 4 }}>{result.product_name}</p>
            )}
            
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              التحميلات المتبقية: <strong style={{ color: '#10b981' }}>{result.remaining_downloads}</strong>
            </p>

            <button
              onClick={handleDownload}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={18} /> تحميل الملف
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
