import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { portfolio, services, blog, config } = useData();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleToggleEvent = () => setIsOpen((prev) => !prev);

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('toggle-command-palette', handleToggleEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('toggle-command-palette', handleToggleEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const navLinks = config?.navLinks?.filter(l => l.enabled) || [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Kỹ năng', href: '/skills' },
    { label: 'Dự án', href: '/portfolio' },
    { label: 'Dịch vụ', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'Liên hệ', href: '/contact' },
  ];

  // Aggregate searchable items
  const items = [
    ...navLinks.map((p) => ({ id: p.href, title: p.label || p.labelEn, type: 'Trang', icon: '📄', url: p.href })),
    ...(portfolio || []).map((p) => ({ id: p._id, title: p.title, type: 'Dự án', icon: '🚀', url: `/portfolio/${p.slug || p._id}` })),
    ...(services || []).map((s) => ({ id: s._id, title: s.name, type: 'Dịch vụ', icon: '💼', url: '/services' })),
    ...(blog || []).map((b) => ({ id: b._id, title: b.title, type: 'Bài viết', icon: '📝', url: `/blog/${b.slug || b._id}` })),
  ];

  const filteredItems = query
    ? items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : items.slice(0, 8); // Show default suggestions if no query

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (url) => {
    navigate(url);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].url);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4" onClick={() => setIsOpen(false)}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input */}
          <div className="relative flex items-center px-4 py-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <svg className="w-5 h-5 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none outline-none px-4 text-lg"
              placeholder={t('command.placeholder', 'Tìm kiếm trang, dự án, dịch vụ...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 rounded text-xs opacity-50 hover:opacity-100 transition-opacity"
              style={{ background: 'var(--bg-secondary)' }}
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2" style={{ scrollbarWidth: 'none' }}>
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Không tìm thấy kết quả nào cho "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left`}
                      style={{
                        background: isSelected ? 'var(--accent-muted)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md opacity-70" style={{ background: 'var(--bg-secondary)' }}>
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t text-xs flex items-center gap-4 opacity-60" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-black/20">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/20">↓</kbd> để di chuyển</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-black/20">↵</kbd> để chọn</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-black/20">ESC</kbd> để đóng</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
