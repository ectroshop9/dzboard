import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, FileText, Bot, ArrowLeft, ChevronLeft
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
        gap: 16,
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
            padding: 20,
            background: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: 20,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'right'
          }}
        >
          <div style={{
            background: '#3b82f6',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={28} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              طلبات المتجر
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              عرض الطلبات القادمة من المتجر الإلكتروني
            </div>
          </div>
          <ChevronLeft size={20} color="#94a3b8" />
        </button>

        {/* بطاقة طلبات البوت */}
        <button
          onClick={() => navigate('/admin/bot-orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 20,
            background: '#fff',
            border: '2px solid #8b5cf6',
            borderRadius: 20,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'right'
          }}
        >
          <div style={{
            background: '#8b5cf6',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bot size={28} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              طلبات البوت 🤖
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              عرض الطلبات القادمة من بوت ماسنجر
            </div>
          </div>
          <ChevronLeft size={20} color="#94a3b8" />
        </button>

        {/* بطاقة الطلبات الخاصة */}
        <button
          onClick={() => navigate('/admin/requests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 20,
            background: '#fff',
            border: '2px solid #f59e0b',
            borderRadius: 20,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'right'
          }}
        >
          <div style={{
            background: '#f59e0b',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={28} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              الطلبات الخاصة
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              عرض الطلبات المخصصة من العملاء
            </div>
          </div>
          <ChevronLeft size={20} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}