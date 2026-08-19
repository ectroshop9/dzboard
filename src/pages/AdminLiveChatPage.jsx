import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowRight, Loader2, User, Clock } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminLiveChatPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) navigate('/admin');
    else fetchMessages();
    
    // تحديث كل 5 ثواني
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/live-chat/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    
    try {
      await fetch(`${API}/live-chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: input.trim(), sender: 'admin' })
      });
      setInput('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 120, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin/orders-menu')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>المحادثة المباشرة 🔴</h1>
          </div>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>🟢 متصل</div>
        </div>

        {/* رسائل */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          border: '1px solid #e2e8f0',
          height: 400,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 12
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <User size={40} style={{ marginBottom: 10, color: '#cbd5e1' }} />
              <p>لا توجد رسائل بعد</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={{
                maxWidth: '80%',
                alignSelf: msg.sender === 'admin' ? 'flex-start' : 'flex-end',
                background: msg.sender === 'admin' ? '#eff6ff' : '#3b82f6',
                color: msg.sender === 'admin' ? '#1e293b' : '#fff',
                padding: '10px 14px',
                borderRadius: msg.sender === 'admin' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                fontSize: 13,
                whiteSpace: 'pre-line'
              }}>
                {msg.message}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-DZ')}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* إدخال */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب ردك..."
            style={{
              flex: 1,
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              fontSize: 13,
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </main>
    </div>
  );
}