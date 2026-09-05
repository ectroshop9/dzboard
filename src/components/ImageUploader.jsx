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
    
    // ✅ تحويل الصورة إلى Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ image: reader.result })
        });
        
        const data = await res.json();
        
        if (data.success) {
          onChange(data.url);
        } else {
          alert(data.message || 'فشل الرفع');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('خطأ في الرفع');
      } finally {
        setUploading(false);
      }
    };
    
    reader.onerror = () => {
      alert('خطأ في قراءة الملف');
      setUploading(false);
    };
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>
        {label}
      </label>
      
      {value ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10,
          padding: '10px',
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 10
        }}>
          <img 
            src={value} 
            alt={label} 
            style={{ 
              width: 60, 
              height: 60, 
              objectFit: 'cover', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
            onClick={() => window.open(value, '_blank')}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ تم الرفع</div>
            <div style={{ fontSize: 10, color: '#64748b', wordBreak: 'break-all', maxWidth: 150, maxHeight: 30, overflow: 'hidden' }}>
              {value}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ 
              background: '#fee2e2', 
              border: 'none', 
              color: '#b91c1c', 
              borderRadius: 6, 
              padding: '6px 10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <X size={14} /> حذف
          </button>
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
          color: '#64748b',
          transition: 'all 0.3s',
          minHeight: 45
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.background = '#eff6ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.background = '#f8fafc';
        }}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>{placeholder || 'اضغط لرفع صورة'}</span>
            </>
          )}
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
