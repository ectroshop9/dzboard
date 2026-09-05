import { useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';

const getToken = () => {
  const tokenData = localStorage.getItem('dzboard_admin_token');
  try {
    const parsed = JSON.parse(tokenData);
    return parsed.token || tokenData;
  } catch {
    return tokenData;
  }
};

export default function ImageUploader({ value, onChange, label, placeholder }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
      } else {
        alert(data.message || 'فشل الرفع');
      }
    } catch (err) {
      alert('خطأ في الرفع');
    }
    setUploading(false);
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>
        {label}
      </label>
      
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={value} alt={label} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
          <span style={{ fontSize: 11, color: '#10b981' }}>تم الرفع ✓</span>
        </div>
      ) : (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px',
          border: '2px dashed #cbd5e1',
          borderRadius: 10,
          cursor: 'pointer',
          background: '#f8fafc',
          fontSize: 13,
          color: '#64748b'
        }}>
          {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
          {uploading ? 'جاري الرفع...' : placeholder || 'اضغط لرفع صورة'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
