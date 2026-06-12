import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { config } = useData();
  const location = useLocation();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const navLinks = useMemo(() => {
    if (config?.navLinks && config.navLinks.length > 0) {
      return config.navLinks.filter(l => l.enabled);
    }
    return [
      { label: 'Trang chủ', labelEn: 'Home', href: '/' },
      { label: 'Giới thiệu', labelEn: 'About', href: '/about' },
      { label: 'Kỹ năng', labelEn: 'Skills', href: '/skills' },
      { label: 'Dự án', labelEn: 'Portfolio', href: '/portfolio' },
      { label: 'Dịch vụ', labelEn: 'Services', href: '/services' },
      { label: 'Hành trình', labelEn: 'Timeline', href: '/timeline' },
      { label: 'Đánh giá', labelEn: 'Testimonials', href: '/testimonials' },
      { label: 'FAQ', labelEn: 'FAQ', href: '/faq' },
      { label: 'Blog', labelEn: 'Blog', href: '/blog' },
      { label: 'Liên hệ', labelEn: 'Contact', href: '/contact' },
    ];
  }, [config?.navLinks]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Sliding indicator
  useEffect(() => {
    const target = hoveredLink || location.pathname;
    const idx = navLinks.findIndex(l => l.href === target);
    if (idx !== -1 && navRefs.current[idx]) {
      const el = navRefs.current[idx];
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    } else {
      setIndicator(prev => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredLink, location.pathname, navLinks]);

  const toggleLang = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('mvd-lang', newLang);
  };

  const getLabel = (link) => i18n.language === 'en' && link.labelEn ? link.labelEn : link.label;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${
          scrolled
            ? 'py-3 shadow-lg'
            : 'py-5'
        }`}
        style={{
          background: scrolled ? 'var(--bg-glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
        }}
      >
        <div className="container-main flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-display text-xl font-bold tracking-wide z-10 flex items-center gap-2">
            <span className="gradient-text">MVD</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Tech</span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1 relative"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {/* Sliding indicator */}
            <div
              className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300 pointer-events-none"
              style={{
                background: 'var(--accent-gradient)',
                left: `${indicator.left}px`,
                width: `${indicator.width}px`,
                opacity: indicator.opacity,
              }}
            />
            {navLinks.map((link, idx) => (
              <Link
                key={link.href}
                to={link.href}
                ref={el => navRefs.current[idx] = el}
                onMouseEnter={() => setHoveredLink(link.href)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                  location.pathname === link.href
                    ? ''
                    : 'hover:opacity-80'
                }`}
                style={{
                  color: location.pathname === link.href || hoveredLink === link.href
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                }}
              >
                {getLabel(link)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 z-10">
            {/* Command Palette trigger */}
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-command-palette'))}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
              style={{
                background: 'var(--accent-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>⌘K</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 text-xs font-bold"
              style={{ 
                color: 'var(--text-secondary)',
                background: 'transparent',
              }}
              title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              {i18n.language === 'vi' ? 'EN' : 'VI'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              onClick={() => setMobileOpen(true)}
              style={{ color: 'var(--text-primary)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] z-[201] flex flex-col"
              style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--glass-border)' }}
            >
              <div className="p-6 flex justify-end">
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ color: 'var(--text-secondary)' }}
                  className="hover:opacity-70"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-2 px-6">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200"
                    style={{
                      color: location.pathname === link.href ? 'var(--accent)' : 'var(--text-primary)',
                      background: location.pathname === link.href ? 'var(--accent-muted)' : 'transparent',
                    }}
                  >
                    {getLabel(link)}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
