import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { config } = useData();
  const { i18n } = useTranslation();

  const socialIcons = {
    github: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
    facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    linkedin: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  };

  return (
    <footer className="relative z-10 border-t" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-secondary)' }}>
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-xl font-bold">
              <span className="gradient-text">MVD</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Tech</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {config?.slogan || 'Code. Design. Create.'}
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-4">
              {config?.socialLinks && Object.entries(config.socialLinks).map(([key, url]) => {
                if (!url || !socialIcons[key]) return null;
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    {socialIcons[key]}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {['/portfolio', '/services', '/blog', '/contact'].map(href => (
                <Link key={href} to={href} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  {href.replace('/', '').charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Contact
            </h4>
            {config?.socialLinks?.email && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(config.socialLinks.email);
                  import('../common/Toast').then(m => m.showToast(i18n.language === 'vi' ? 'Đã sao chép email!' : 'Email copied!'));
                }}
                className="text-sm flex items-center gap-2 transition-colors hover:opacity-80 cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {config.socialLinks.email}
              </button>
            )}
            {config?.socialLinks?.phone && (
              <a href={`tel:${config.socialLinks.phone}`} className="text-sm flex items-center gap-2 mt-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                {config.socialLinks.phone}
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
          {config?.footerText || `© ${new Date().getFullYear()} MVD Tech. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
