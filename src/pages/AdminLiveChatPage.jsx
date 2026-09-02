import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowRight, Loader2, User, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

const API = '/api';

export default function AdminLiveChatPage() {
  const navigate = useNavigate();
  const tokenData = localStorage.getItem('dzboard_admin_token'); const token = (() => { try { return JSON.parse(tokenData).token; } catch { return tokenData; } })();
  const [conversations, setConversations] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) navigate('/admin');
    else fetchConversations();
    
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedSession]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/live-chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setConversations(data.conversations || {});
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!input.trim() || !selectedSession) return;
    setSending(true);
    
    try {
      await fetch(`${API}/live-chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          message: input.trim(), 
          sender: 'admin',
          session_id: selectedSession
        })
      });
      setInput('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (sessionId) => {
    if (!confirm('حذف هذه المحادثة كاملة؟')) return;
    await fetch(`${API}/live-chat/conversation/${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (selectedSession === sessionId) setSelectedSession(null);
    fetchConversations();
  };

  const sessionKeys = Object.keys(conversations);
  const selectedMessages = selectedSession ? conversations[selectedSession] || [] : [];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 120, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
        {/* الهيدر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin/orders-menu')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>المحادثة المباشرة 🔴</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>🟢 متصل</span>
            <button onClick={fetchConversations} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, minHeight: 500 }}>
          {/* قائمة المحادثات */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 14 }}>
              📥 صندوق الوارد ({sessionKeys.length})
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 450 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
              ) : sessionKeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  <MessageSquare size={32} style={{ marginBottom: 8, color: '#cbd5e1' }} />
                  <p style={{ fontSize: 12 }}>لا توجد محادثات</p>
                </div>
              ) : (
                sessionKeys.map(sessionId => {
                  const msgs = conversations[sessionId];
                  const lastMsg = msgs[msgs.length - 1];
                  const customerMsgs = msgs.filter(m => m.sender === 'customer').length;
                  
                  return (
                    <div 
                      key={sessionId}
                      onClick={() => setSelectedSession(sessionId)}
                      style={{
                        padding: 12,
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedSession === sessionId ? '#eff6ff' : '#fff',
                        borderRight: selectedSession === sessionId ? '4px solid #3b82f6' : '4px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ background: '#3b82f6', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#fff" />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800 }}>عميل</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{customerMsgs} رسائل</div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteConversation(sessionId); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg?.message || ''}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        {lastMsg ? new Date(lastMsg.created_at).toLocaleString('ar-DZ') : ''}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* منطقة المحادثة */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            {!selectedSession ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 10 }}>
                <MessageSquare size={48} style={{ color: '#cbd5e1' }} />
                <p>اختر محادثة من القائمة</p>
              </div>
            ) : (
              <>
                {/* رسائل المحادثة */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400 }}>
                  {selectedMessages.map(msg => (
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
                      <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 4, opacity: 0.8 }}>
                        {msg.sender === 'admin' ? '👨‍💼 أنت' : '👤 العميل'}
                      </div>
                      {msg.message}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-DZ')}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* إدخال الرد */}
                <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    placeholder="اكتب ردك..."
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
                    onClick={sendReply}
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}