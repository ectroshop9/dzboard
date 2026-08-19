import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, Wrench, Trash2 } from 'lucide-react';
import './ChatBot.css';

const API = 'https://dzboard.onrender.com/api';

// خريطة أنماط الأزرار بحسب الرمز/النوع
const BUTTON_STYLES = [
  { prefix: '🛍️', bg: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' },
  { prefix: '🔍', bg: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' },
  { prefix: '📦', bg: '#e0e7ff', color: '#4338ca', border: '1px solid #a5b4fc' },
  { prefix: '📍', bg: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' },
  { prefix: '🚚', bg: '#fce7f3', color: '#be185d', border: '1px solid #f9a8d4' },
  { prefix: '💳', bg: '#cffafe', color: '#0e7490', border: '1px solid #67e8f9' },
  { prefix: '🔄', bg: '#fef9c3', color: '#a16207', border: '1px solid #fde047' },
  { prefix: '🛡️', bg: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
  { prefix: '🔧', bg: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe' },
  { prefix: '📞', bg: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
  { prefix: '🔙', bg: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }
];

const getButtonStyle = (btnText) => {
  const match = BUTTON_STYLES.find(style => btnText.includes(style.prefix));
  return match || { bg: '#3b82f6', color: '#fff', border: 'none' };
};

const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'bot',
  text: '👋 أهلاً بك في DZBoard! كيف يمكنني مساعدتك؟',
  buttons: [
    '🛍️ تصفح المنتجات',
    '🔍 البحث عن قطعة',
    '📦 تتبع طلبك',
    '📍 حساب التوصيل',
    '🚚 مدة التوصيل',
    '💳 طرق الدفع',
    '🔄 سياسة الإرجاع',
    '🛡️ الضمان',
    '🔧 طلب قطعة',
    '📞 اتصل بنا'
  ]
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [awaitingState, setAwaitingState] = useState(null);
  const [pendingPartName, setPendingPartName] = useState('');

  const messagesEndRef = useRef(null);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // حفظ واستعادة المحادثة
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dzboard_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dzboard_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages]);

  // التمرير التلقائي
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdVtjanB5e35/jI2PkJGUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAA0MDRk=');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const addMessage = useCallback((type, text, extra = null, buttons = null, specialButton = null) => {
    setMessages(prev => {
      const newMsg = { id: Date.now() + Math.random(), type, text, extra, buttons, specialButton };
      return [...prev.slice(-49), newMsg];
    });

    if (type === 'bot') playNotificationSound();
  }, []);

  const botTyping = async (delay = 800) => {
    setTyping(true);
    await new Promise(r => setTimeout(r, delay));
    setTyping(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.products || [];
    } catch {
      return [];
    }
  };

  // حفظ طلب قطعة في قاعدة البيانات
  const savePartRequest = async (partName, phone) => {
    try {
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'عميل البوت',
          phone: phone,
          part_name: partName,
          notes: 'طلب من ChatBot'
        })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  };

  const showProducts = async (products) => {
    clearAllTimeouts();
    if (products.length === 0) {
      await botTyping();
      addMessage('bot', '❌ عذراً، لا توجد منتجات متاحة حالياً.', null, ['🔙 القائمة الرئيسية']);
      return;
    }

    await botTyping();
    addMessage('bot', `🛍️ وجدت ${products.length} منتج:`);

    const chunk = products.slice(0, 5);
    chunk.forEach((p, i) => {
      const timer = setTimeout(() => {
        addMessage('bot', null, {
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          image: p.image
        });
      }, (i + 1) * 600);
      timeoutsRef.current.push(timer);
    });

    const finalTimer = setTimeout(() => {
      addMessage('bot', 'هل تريد شيئاً آخر؟', null, ['🔍 البحث عن قطعة', '📍 حساب التوصيل', '🔙 القائمة الرئيسية']);
    }, (chunk.length + 1) * 600);
    timeoutsRef.current.push(finalTimer);
  };

  const fetchShippingFee = async (wilayaId) => {
    try {
      const res = await fetch(`${API}/shipping/fee?wilaya_id=${wilayaId}`);
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  const trackDHD = async (trackingNumber) => {
    try {
      const res = await fetch(`${API}/shipping/track?tracking=${trackingNumber}`);
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    addMessage('user', messageText);
    setInput('');

    const lower = messageText.toLowerCase();

    // حالة طلب قطعة - اسم القطعة
    if (awaitingState === 'part_name') {
      setPendingPartName(messageText);
      setAwaitingState('part_phone');
      await botTyping();
      addMessage('bot', `📱 حسناً، "${messageText}"\nالآن من فضلك أرسل رقم هاتفك للتواصل معك:`, null, ['🔙 القائمة الرئيسية']);
      return;
    }

    // حالة طلب قطعة - رقم الهاتف
    if (awaitingState === 'part_phone') {
      const phone = messageText;
      setAwaitingState(null);
      await botTyping();
      
      const data = await savePartRequest(pendingPartName, phone);
      
      if (data.success) {
        addMessage('bot', `✅ تم تسجيل طلبك بنجاح!\n\n🔧 القطعة: ${pendingPartName}\n📱 الهاتف: ${phone}\n\n📞 سنتحقق من توفرها ونتواصل معك قريباً.`, null, ['🔙 القائمة الرئيسية']);
      } else {
        addMessage('bot', '❌ حدث خطأ في تسجيل طلبك. حاول مرة أخرى.', null, ['🔧 طلب قطعة', '🔙 القائمة الرئيسية']);
      }
      setPendingPartName('');
      return;
    }

    // حالة تتبع
    if (awaitingState === 'track') {
      setAwaitingState(null);
      await botTyping();
      
      if (messageText.startsWith('DHD') || messageText.startsWith('dhd') || messageText.length > 10) {
        const data = await trackDHD(messageText.replace('#', ''));
        if (data && data.success && data.shipment) {
          addMessage('bot', `📦 حالة الشحنة: ${messageText}\n\n📊 الحالة: ${data.shipment.status || 'غير معروف'}\n📍 الموقع: ${data.shipment.location || 'غير متوفر'}`, null, ['🔙 القائمة الرئيسية']);
        } else {
          addMessage('bot', `🔗 يمكنك تتبع شحنتك من هنا:\n${window.location.origin}/track/${messageText}`, null, ['🔙 القائمة الرئيسية']);
        }
      } else {
        addMessage('bot', `📦 يمكنك تتبع طلبك عبر الرابط التالي:\n${window.location.origin}/track/${messageText.replace('#', '')}`, null, ['🔙 القائمة الرئيسية']);
      }
      return;
    }

    // حالة بحث
    if (awaitingState === 'search') {
      setAwaitingState(null);
      await botTyping();
      const products = await fetchProducts();
      const norm = messageText.toLowerCase().trim();
      const found = products.filter(p => 
        (p.name || '').toLowerCase().includes(norm) || 
        (p.category || '').toLowerCase().includes(norm)
      );
      await showProducts(found);
      return;
    }

    // حالة ولاية
    if (awaitingState === 'wilaya') {
      setAwaitingState(null);
      const id = parseInt(messageText, 10);
      if (id >= 1 && id <= 58) {
        await botTyping();
        const data = await fetchShippingFee(id);
        if (data && data.success && data.fees) {
          addMessage('bot', `📍 تكلفة التوصيل للولاية ${id}:\n\n🏠 للمنزل: ${data.fees.domicile} دج\n🏢 للمكتب: ${data.fees.stopdesk} دج`, null, ['🔙 القائمة الرئيسية']);
        } else {
          addMessage('bot', '❌ عذراً، لم نتمكن من حساب التكلفة.', null, ['🔙 القائمة الرئيسية']);
        }
      } else {
        await botTyping();
        addMessage('bot', '❌ رقم الولاية غير صحيح. يرجى إدخال رقم بين 1 و 58.', null, ['🔙 القائمة الرئيسية']);
      }
      return;
    }

    // تصفح المنتجات
    if (messageText.includes('تصفح المنتجات')) {
      const products = await fetchProducts();
      await showProducts(products);
      return;
    }

    // البحث عن قطعة
    if (messageText.includes('البحث عن قطعة')) {
      setAwaitingState('search');
      await botTyping();
      addMessage('bot', '🔍 من فضلك أرسل اسم القطعة أو الرقم التسلسلي:');
      return;
    }

    // تتبع طلب
    if (messageText.includes('تتبع')) {
      setAwaitingState('track');
      await botTyping();
      addMessage('bot', '📦 من فضلك أرسل رقم الطلب أو رقم التتبع (DHD):');
      return;
    }

    // حساب التوصيل
    if (messageText.includes('حساب التوصيل')) {
      setAwaitingState('wilaya');
      await botTyping();
      addMessage('bot', '📍 من فضلك أرسل رقم الولاية (مثال: 16 للجزائر العاصمة):');
      return;
    }

    // مدة التوصيل
    if (messageText.includes('مدة التوصيل')) {
      await botTyping();
      addMessage('bot', '🚚 مدة التوصيل:\n\n📍 الولايات الشمالية: 1-2 يوم\n📍 الولايات الوسطى: 2-3 أيام\n📍 الولايات الصحراوية وأقصى الجنوب: 2-4 أيام\n\n⚠️ قد تتأخر الشحنات في أوقات الذروة أو الأحوال الجوية السيئة.', null, ['📍 حساب التوصيل', '🔙 القائمة الرئيسية']);
      return;
    }

    // طرق الدفع
    if (messageText.includes('طرق الدفع') || messageText.includes('الدفع') || messageText.includes('بريدي') || messageText.includes('موب')) {
      await botTyping();
      addMessage('bot', '💳 طرق الدفع المتاحة:\n\n1️⃣ الدفع عند الاستلام 💵\n   - ادفع للموزع عند وصول طلبك\n\n2️⃣ بريدي موب 📱\n   - الدفع الإلكتروني عبر تطبيق بريدي موب\n\n✅ نضمن لك عملية دفع آمنة وموثوقة.', null, ['🛍️ تصفح المنتجات', '🔙 القائمة الرئيسية']);
      return;
    }

    // سياسة الإرجاع
    if (messageText.includes('سياسة الإرجاع') || messageText.includes('ارجاع') || messageText.includes('إرجاع') || messageText.includes('استبدال')) {
      await botTyping();
      addMessage('bot', '🔄 سياسة الإرجاع:\n\n✅ يمكنك إرجاع المنتج خلال 7 أيام من الاستلام\n✅ يجب أن يكون المنتج في حالته الأصلية\n✅ مع التغليف الأصلي وجميع الملحقات\n\n❌ لا يمكن إرجاع:\n- المنتجات التي تم استخدامها\n- المنتجات المتضررة من سوء الاستخدام\n\n📞 للإرجاع، تواصل معنا وسنرشدك للخطوات.', null, ['📞 اتصل بنا', '🔙 القائمة الرئيسية']);
      return;
    }

    // الضمان
    if (messageText.includes('الضمان') || messageText.includes('ضمان')) {
      await botTyping();
      addMessage('bot', '🛡️ الضمان:\n\n✅ جميع منتجاتنا مضمونة\n\n📋 مدة الضمان:\n- الكروت الإلكترونية: 6 أشهر\n- لوحات التغذية: 6 أشهر\n- القطع الأخرى: حسب المنتج\n\n⚠️ الضمان لا يشمل:\n- التلف الناتج عن سوء الاستخدام\n- الكسر أو الحرق\n- العبث بالمنتج\n\n📞 للاستفادة من الضمان، تواصل معنا.', null, ['📞 اتصل بنا', '🔙 القائمة الرئيسية']);
      return;
    }

    // طلب قطعة - بداية المحادثة
    if (messageText.includes('طلب قطعة')) {
      setAwaitingState('part_name');
      await botTyping();
      addMessage('bot', '🔧 من فضلك أرسل اسم القطعة التي تبحث عنها:');
      return;
    }

    // اتصل بنا
    if (messageText.includes('اتصل بنا')) {
      await botTyping();
      addMessage('bot', '📞 للتواصل معنا:\n📱 الهاتف: 0673310066\n📧 الإيميل: contact@dzboard.com', null, ['🔙 القائمة الرئيسية']);
      return;
    }

    // القائمة الرئيسية
    if (messageText.includes('القائمة الرئيسية')) {
      clearAllTimeouts();
      setAwaitingState(null);
      setPendingPartName('');
      await botTyping(400);
      addMessage('bot', WELCOME_MESSAGE.text, null, WELCOME_MESSAGE.buttons);
      return;
    }

    // الترحيب
    if (['سلام', 'مرحبا', 'اهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'hi', 'hello', 'salut', 'bonjour'].some(g => lower.includes(g))) {
      clearAllTimeouts();
      setAwaitingState(null);
      setPendingPartName('');
      await botTyping(400);
      addMessage('bot', WELCOME_MESSAGE.text, null, WELCOME_MESSAGE.buttons);
      return;
    }

    // بحث افتراضي
    await botTyping();
    const products = await fetchProducts();
    const norm = messageText.toLowerCase().trim();
    const found = products.filter(p => 
      (p.name || '').toLowerCase().includes(norm) || 
      (p.category || '').toLowerCase().includes(norm)
    );
    await showProducts(found);
  };

  const clearChat = () => {
    clearAllTimeouts();
    setAwaitingState(null);
    setPendingPartName('');
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem('dzboard_chat_history');
  };

  return (
    <div dir="rtl" className="dzboard-chatbot-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="chatbot-toggle"
        aria-label="افتح الشات بوت"
      >
        {open ? <X size={26} /> : <Bot size={26} />}
      </button>

      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <Bot size={24} />
            <div className="header-info">
              <span className="bot-title">DZBoard Bot</span>
              <span className="bot-status">🟢 متصل الآن</span>
            </div>
            <button onClick={clearChat} className="clear-btn" title="مسح المحادثة">
              <Trash2 size={14} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id || Math.random()} className="message-row">
                {msg.type === 'bot' && msg.text && (
                  <div className="msg-bubble bot">{msg.text}</div>
                )}

                {msg.type === 'bot' && msg.extra && (
                  <div className="product-card">
                    <img
                      src={msg.extra.image || '/default-product.jpg'}
                      alt={msg.extra.name}
                      onError={(e) => (e.target.src = '/default-product.jpg')}
                    />
                    <div className="product-info">
                      <div className="product-name">{msg.extra.name}</div>
                      <div className="product-price">
                        {parseFloat(msg.extra.price || 0).toLocaleString()} دج
                      </div>
                      <div className={`product-stock ${msg.extra.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {msg.extra.stock > 0 ? '✅ متوفر' : '❌ غير متوفر'}
                      </div>
                      <button onClick={() => window.open(`/checkout?product=${msg.extra.id}`, '_blank')}>
                        اطلب الآن
                      </button>
                    </div>
                  </div>
                )}

                {msg.specialButton && (
                  <button onClick={msg.specialButton.action} className="special-btn">
                    <Wrench size={18} />
                    {msg.specialButton.label}
                  </button>
                )}

                {msg.buttons && (
                  <div className="buttons-group">
                    {msg.buttons.map((btn, bi) => {
                      const style = getButtonStyle(btn);
                      return (
                        <button
                          key={bi}
                          onClick={() => handleSend(btn)}
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            border: style.border
                          }}
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </div>
                )}

                {msg.type === 'user' && (
                  <div className="msg-bubble user">{msg.text}</div>
                )}
              </div>
            ))}

            {typing && <div className="typing-indicator">...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="chatbot-footer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="اكتب رسالتك..."
            />
            <button onClick={() => handleSend(input)} aria-label="إرسال">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}