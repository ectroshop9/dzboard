import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, FileText, ArrowLeft, MessageSquare
} from 'lucide-react';

export default function AdminOrdersMenuPage() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: ShoppingBag,
      title: 'طلبات المتجر',
      desc: 'طلبات المتجر الإلكتروني',
      color: '#3b82f6',
      path: '/admin/orders'
    },
    {
      icon: FileText,
      title: 'الطلبات الخاصة',
      desc: 'طلبات مخصصة من العملاء',
      color: '#f59e0b',
      path: '/admin/requests'
    },
    {
      icon: MessageSquare,
      title: 'محادثات البوت',
      desc: 'أسئلة العملاء للبوت',
      color: '#10b981',
      path: '/admin/chat-logs'
    }
  ];

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
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0f172a' }}>
          الطلبات
        </h1>
      </div>

      {/* المحتوى */}
      <div style={{
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 10,
        maxWidth: 500,
        margin: '0 auto',
        width: '100%'
      }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '16px 12px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = item.color;
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{
                background: item.color,
                borderRadius: 10,
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44
              }}>
                <Icon size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}