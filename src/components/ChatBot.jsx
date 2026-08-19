import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Package, Search, Truck, Phone, ShoppingBag } from 'lucide-react';
import './ChatBot.css';

const API = 'https://dzboard.onrender.com/api';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 أهلاً بك في DZBoard! كيف يمكنني مساعدتك؟', buttons: ['🛍️ تصفح المنتجات', '🔍 البحث عن قطعة', '📦 تتبع طلبك', '📍 حساب التوصيل', '📞 اتصل بنا'] }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [awaitingTrack, setAwaitingTrack] = useState(false);
  const [awaitingSearch, setAwaitingSearch] = useState(false);
  const [awaitingWilaya, setAwaitingWilaya] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // جلب المنتجات
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      return data.products || [];
    } catch (error) {
      return [];
    }
  };

  // إضافة رسالة
  const addMessage = (type, text, extra = null, buttons = null) => {
    setMessages(prev => [...prev, { type, text, extra, buttons }]);
  };

  // محاكاة الكتابة
  const botTyping = async (delay = 800) => {
    setTyping(true);
    await new Promise(r => setTimeout(r, delay));
    setTyping(false);
  };

  // عرض المنتجات
  const showProducts = async (products) => {
    if (products.length === 0) {
      await botTyping();
      addMessage('bot', '❌ عذراً، لا توجد منتجات متاحة حالياً.', null, ['🔙 القائمة الرئيسية']);
      return;
    }

    await botTyping();
    addMessage('bot', `🛍️ وجدت ${products.length} منتج:`);
    
    const chunk = products.slice(0, 5);
    chunk.forEach((p, i) => {
      setTimeout(() => {
        addMessage('bot', null, {
          name: p.name,
          price: p.price,
          stock: p.stock,
          image: p.image,
          id: p.id
        });
      }, (i + 1) * 600);
    });

    setTimeout(() => {
      addMessage('bot', 'هل تريد شيئاً آخر؟', null, ['🔍 البحث عن قطعة', '📍 حساب التوصيل', '🔙 القائمة الرئيسية']);
    }, (chunk.length + 1) * 600);
  };

  // البحث عن منتج
  const searchProducts = async (query) => {
    const products = await fetchProducts();
    const normalized = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const found = products.filter(p => {
      const name = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const category = (p.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return name.includes(normalized) || category.includes(normalized);
    });

    await showProducts(found);
  };

  // تتبع طلب DHD
  const trackDHD = async (trackingNumber) => {
    await botTyping();
    try {
      const res = await fetch(`${API}/shipping/track?tracking=${trackingNumber}`);
      const data = await res.json();
      
      if (data.success && data.shipment) {
        const s = data.shipment;
        addMessage('bot', `📦 حالة الشحنة: ${trackingNumber}\n\n📊 الحالة: ${s.status || 'غير معروف'}\n📍 الموقع: ${s.location || 'غير متوفر'}`, null, ['🔙 القائمة الرئيسية']);
      } else {
        addMessage('bot', `🔗 يمكنك تتبع شحنتك من هنا:\n${window.location.origin}/track/${trackingNumber}`, null, ['🔙 القائمة الرئيسية']);
      }
    } catch (error) {
      addMessage('bot', '❌ تعذر تتبع الشحنة حالياً.', null, ['🔙 القائمة الرئيسية']);
    }
  };

  // تتبع طلب
  const trackOrder = async (orderId) => {
    await botTyping();
    
    // إذا كان رقم تتبع DHD
    if (orderId.startsWith('DHD') || orderId.startsWith('dhd') || orderId.length > 10) {
      await trackDHD(orderId);
      return;
    }
    
    // رقم طلب عادي
    addMessage('bot', `📦 رقم الطلب: #${orderId}`);
    addMessage('bot', `🔗 يمكنك تتبع طلبك من هنا: ${window.location.origin}/track/${orderId}`, null, ['🔙 القائمة الرئيسية']);
  };

  // حساب تكلفة التوصيل
  const calculateShipping = async (wilayaId) => {
    await botTyping();
    try {
      const res = await fetch(`${API}/shipping/fee?wilaya_id=${wilayaId}`);
      const data = await res.json();
      
      if (data.success && data.fees) {
        addMessage('bot', `📍 تكلفة التوصيل للولاية ${wilayaId}:\n\n🏠 للمنزل: ${data.fees.domicile} دج\n🏢 للمكتب: ${data.fees.stopdesk} دج`, null, ['🔙 القائمة الرئيسية']);
      } else {
        addMessage('bot', '❌ عذراً، لم نتمكن من حساب التكلفة.', null, ['🔙 القائمة الرئيسية']);
      }
    } catch (error) {
      addMessage('bot', '❌ حدث خطأ في الاتصال.', null, ['🔙 القائمة الرئيسية']);
    }
  };

  // القائمة الرئيسية
  const showMainMenu = async () => {
    setAwaitingTrack(false);
    setAwaitingSearch(false);
    setAwaitingWilaya(false);
    await botTyping(500);
    addMessage('bot', '👋 كيف يمكنني مساعدتك؟', null, ['🛍️ تصفح المنتجات', '🔍 البحث عن قطعة', '📦 تتبع طلبك', '📍 حساب التوصيل', '📞 اتصل بنا']);
  };

  // معالجة الرسالة أو الزر
  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    addMessage('user', messageText);
    setInput('');

    const lower = messageText.toLowerCase();

    // حالة انتظار رقم التتبع
    if (awaitingTrack) {
      setAwaitingTrack(false);
      await trackOrder(messageText.replace('#', ''));
      return;
    }

    // حالة انتظار البحث
    if (awaitingSearch) {
      setAwaitingSearch(false);
      await botTyping();
      await searchProducts(messageText);
      return;
    }

    // حالة انتظار الولاية
    if (awaitingWilaya) {
      setAwaitingWilaya(false);
      const wilayaId = parseInt(messageText);
      if (wilayaId > 0 && wilayaId <= 58) {
        await calculateShipping(wilayaId);
      } else {
        addMessage('bot', '❌ رقم الولاية غير صحيح. جرب من 1 إلى 58', null, ['🔙 القائمة الرئيسية']);
      }
      return;
    }

    // الأزرار السريعة
    if (messageText.includes('تصفح المنتجات')) {
      const products = await fetchProducts();
      await showProducts(products);
      return;
    }

    if (messageText.includes('البحث عن قطعة')) {
      setAwaitingSearch(true);
      await botTyping();
      addMessage('bot', '🔍 من فضلك أرسل اسم القطعة أو الرقم التسلسلي:');
      return;
    }

    if (messageText.includes('حساب التوصيل')) {
      setAwaitingWilaya(true);
      await botTyping();
      addMessage('bot', '📍 من فضلك أرسل رقم الولاية (مثال: 16 للجزائر العاصمة):');
      return;
    }

    if (messageText.includes('تتبع طلبك') || messageText.includes('تتبع')) {
      setAwaitingTrack(true);
      await botTyping();
      addMessage('bot', '📦 من فضلك أرسل رقم الطلب أو رقم التتبع (DHD):');
      return;
    }

    if (messageText.includes('اتصل بنا')) {
      await botTyping();
      addMessage('bot', '📞 للتواصل معنا:\n📱 الهاتف: 0673310066\n📧 الإيميل: contact@dzboard.com', null, ['🔙 القائمة الرئيسية']);
      return;
    }

    if (messageText.includes('القائمة الرئيسية')) {
      await showMainMenu();
      return;
    }

    // الترحيب
    if (['سلام', 'مرحبا', 'اهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'hi', 'hello', 'salut', 'bonjour'].some(g => lower.includes(g))) {
      await showMainMenu();
      return;
    }

    // طلب عرض المنتجات
    if (lower.includes('منتج') || lower.includes('قطع') || lower.includes('كارت') || lower.includes('لوحة') || lower.includes('تغذية') || lower.includes('produit') || lower.includes('product')) {
      const products = await fetchProducts();
      await showProducts(products);
      return;
    }

    // بحث افتراضي
    await botTyping();
    await searchProducts(messageText);
  };

  // فتح رابط المنتج
  const openProduct = (productId) => {
    window.open(`/checkout?product=${productId}`, '_blank');
  };

  return (
    <>
      {/* زر البوت العائم */}
      <button
        onClick={() => setOpen(!open)}
        className="chatbot-toggle"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: open ? '#ef4444' : '#3b82f6',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999,
          transition: 'all 0.3s'
        }}
      >
        {open ? <X size={28} /> : <Bot size={28} />}
      </button>

      {/* نافذة المحادثة */}
      {open && (
        <div className="chatbot-window" style={{
          position: 'fixed',
          bottom: 90,
          left: 20,
          width: 360,
          maxWidth: '90vw',
          height: 500,
          maxHeight: '70vh',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#fff',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Bot size={24} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>DZBoard Bot</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>🟢 متصل الآن</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.type === 'bot' && msg.text && (
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    padding: '10px 14px',
                    borderRadius: '12px 12px 12px 4px',
                    maxWidth: '85%',
                    fontSize: 13,
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}
                  </div>
                )}
                
                {msg.type === 'bot' && msg.extra && (
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    padding: 10,
                    borderRadius: 12,
                    maxWidth: '85%',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>
                    <img 
                      src={msg.extra.image || '/default-product.jpg'} 
                      alt={msg.extra.name}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                      onError={(e) => e.target.src = '/default-product.jpg'}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{msg.extra.name}</div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                        {parseFloat(msg.extra.price || 0).toLocaleString('en-US')} دج
                      </div>
                      <div style={{ fontSize: 11, color: msg.extra.stock > 0 ? '#059669' : '#dc2626' }}>
                        {msg.extra.stock > 0 ? '✅ متوفر' : '❌ غير متوفر'}
                      </div>
                      <button
                        onClick={() => openProduct(msg.extra.id)}
                        style={{
                          marginTop: 6,
                          padding: '4px 12px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        اطلب الآن
                      </button>
                    </div>
                  </div>
                )}

                {/* أزرار سريعة */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 4
                  }}>
                    {msg.buttons.map((btn, bi) => (
                      <button
                        key={bi}
                        onClick={() => handleSend(btn)}
                        style={{
                          padding: '8px 14px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 20,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                )}

                {msg.type === 'user' && (
                  <div style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: '12px 12px 4px 12px',
                    maxWidth: '85%',
                    fontSize: 13,
                    marginLeft: 'auto'
                  }}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                padding: '10px 14px',
                borderRadius: '12px 12px 12px 4px',
                maxWidth: 60,
                fontSize: 18,
                animation: 'pulse 1s infinite'
              }}>
                ...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 12,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: 8,
            background: '#fff'
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="اكتب رسالتك..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend(input)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}