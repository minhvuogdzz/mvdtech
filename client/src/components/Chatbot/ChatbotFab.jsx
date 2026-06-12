import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { showToast } from '../common/Toast';

const ChatbotFab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasVisited, setHasVisited] = useState(true);
  const messagesEndRef = useRef(null);

  // Check first visit for Tour Guide
  useEffect(() => {
    const visited = localStorage.getItem('mvd-visited');
    if (!visited) {
      setHasVisited(false);
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!hasVisited) {
        setMessages([{
          id: '1',
          role: 'model',
          content: t('chat.tour_message'),
          isTour: true
        }]);
        localStorage.setItem('mvd-visited', 'true');
        setHasVisited(true);
      } else {
        setMessages([{
          id: '1',
          role: 'model',
          content: t('chat.greeting')
        }]);
      }
    }
  }, [isOpen, messages.length, hasVisited, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].filter(m => !m.isTour);
      const res = await api.post('/chat', { messages: chatHistory });
      
      const { reply, actions } = res.data;
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: reply
      }]);

      // Handle AI Actions
      if (actions && actions.length > 0) {
        actions.forEach(action => {
          if (action.type === 'navigate' && action.target) {
            setTimeout(() => {
              navigate(action.target);
              setIsOpen(false);
            }, 1000);
          } else if (action.type === 'filter' && action.section) {
            // Can be dispatched as a custom event to other components
            document.dispatchEvent(new CustomEvent(`filter-${action.section}`, { detail: action.value }));
          }
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: err.response?.data?.error || 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg relative"
        style={{
          background: isOpen ? '#ef4444' : 'var(--accent-gradient)',
          color: 'white',
          boxShadow: `0 4px 20px ${isOpen ? 'rgba(239,68,68,0.4)' : 'var(--accent-glow)'}`,
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!isOpen && !hasVisited && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Ping animation when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none" style={{ borderColor: 'var(--accent)', opacity: 0.3 }} />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] glass rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ height: '520px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ background: 'var(--accent-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center relative shadow-md" style={{ background: 'var(--accent-gradient)' }}>
                  <span className="text-white text-lg">🤖</span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2" style={{ borderColor: 'var(--bg-glass)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>MVD Tech AI Assistant</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Online</p>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" style={{ background: 'var(--bg-primary)' }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'rounded-2xl rounded-tr-sm text-white shadow-md' : 'rounded-2xl rounded-tl-sm shadow-sm'
                    }`}
                    style={msg.role === 'user' 
                      ? { background: 'var(--accent-gradient)' } 
                      : { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }
                    }
                  >
                    {msg.content}
                    
                    {/* Tour Guide Actions */}
                    {msg.isTour && (
                      <div className="mt-3 flex flex-col gap-2">
                        <button onClick={() => handleSend('Xem dự án')} className="text-xs py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-left transition-colors font-medium text-white border border-white/20">
                          {t('chat.tour_portfolio', 'Xem dự án')} →
                        </button>
                        <button onClick={() => handleSend('Dịch vụ')} className="text-xs py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-left transition-colors font-medium text-white border border-white/20">
                          {t('chat.tour_services', 'Dịch vụ')} →
                        </button>
                        <button onClick={() => { /* just close options */ setMessages(prev => prev.map(m => m.id === msg.id ? {...m, isTour: false} : m)) }} className="text-xs py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-left transition-colors font-medium text-white border border-white/20">
                          {t('chat.tour_chat', 'Trò chuyện tự do')}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3" style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--glass-border)' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 p-1 pl-4 rounded-full"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)' }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder', 'Nhập tin nhắn...')}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotFab;
