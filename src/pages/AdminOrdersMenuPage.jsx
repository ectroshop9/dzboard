import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, FileText, ArrowLeft, ChevronLeft
} from 'lucide-react';

export default function AdminOrdersMenuPage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      background: '#f8fafc', 
      direction: 'rtl', 
      minHeight: '100vh', 
      paddingBottom: 120, 
      fontFamily: 'system-ui',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* الهيدر */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: '#0f172a' }}>
          الطلبات
        </h1>
      </div>

      {/* المحتوى */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 20,
        gap: 20,
        maxWidth: 500,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* بطاقة طلبات المتجر */}
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 24,
            background: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: 20,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)',
            width: '100%',
            textAlign: 'right'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            background: '#3b82f6',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={32} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              طلبات المتجر
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              عرض الطلبات القادمة من المتجر الإلكتروني
            </div>
          </div>
          <ChevronLeft size={24} color="#94a3b8" />
        </button>

        {/* بطاقة الطلبات الخاصة */}
        <button
          onClick={() => navigate('/admin/requests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 24,
            background: '#fff',
            border: '2px solid #f59e0b',
            borderRadius: 20,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
            width: '100%',
            textAlign: 'right'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            background: '#f59e0b',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={32} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              الطلبات الخاصة
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              عرض الطلبات المخصصة من العملاء
            </div>
          </div>
          <ChevronLeft size={24} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}