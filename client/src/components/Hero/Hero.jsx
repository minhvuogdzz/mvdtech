import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';

const TypingAnimation = ({ roles = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (roles.length === 0) return;
    const currentRole = roles[currentIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
        if (displayText === currentRole) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, isDeleting ? 50 : 100);
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentIndex, roles]);

  return (
    <span className="typing-container flex items-center">
      <span className="text-blue-500 mr-2 opacity-70">~</span>
      <span className="typing-text font-mono tracking-tight" style={{ color: 'var(--accent-hover)', textShadow: '0 0 10px var(--accent-glow)' }}>{displayText}</span>
      <span className="w-2 h-8 ml-1 bg-blue-500 animate-pulse"></span>
    </span>
  );
};

const StatItem = ({ value, label, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const numValue = parseInt(value) || 0;

  useEffect(() => {
    if (numValue === 0) return;
    let start = 0;
    const duration = 2000;
    const step = duration / numValue;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start++;
        setCount(start);
        if (start >= numValue) clearInterval(interval);
      }, step);
    }, delay);
    return () => clearTimeout(timer);
  }, [numValue, delay]);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold gradient-text">{count}+</div>
      <div className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
};

const MarqueeBackground = ({ images1 = [], images2 = [], speed = 40 }) => {
  if (!images1.length && !images2.length) return null;
  
  const row1 = [...images1, ...images1, ...images1, ...images1];
  const row2 = [...images2, ...images2, ...images2, ...images2];

  return (
    <div className="absolute top-0 left-0 right-0 h-[100dvh] z-0 overflow-hidden opacity-60 pointer-events-none flex flex-col justify-center gap-16 sm:gap-32 -rotate-6 scale-125" style={{ '--marquee-speed': `${speed}s` }}>
      {images1.length > 0 && (
        <div className="marquee-container items-center">
          <div className="marquee-content scroll-left items-center">
            {row1.map((img, i) => (
              <div key={`orig-1-${i}`} className="h-32 sm:h-48 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center px-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mx-4 sm:mx-8">
                <img src={img} alt="Bg" className="h-full w-auto object-contain max-w-[250px] sm:max-w-[400px]" />
              </div>
            ))}
          </div>
          <div className="marquee-content scroll-left items-center" aria-hidden="true">
            {row1.map((img, i) => (
              <div key={`dup-1-${i}`} className="h-32 sm:h-48 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center px-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mx-4 sm:mx-8">
                <img src={img} alt="Bg" className="h-full w-auto object-contain max-w-[250px] sm:max-w-[400px]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {images2.length > 0 && (
        <div className="marquee-container items-center">
          <div className="marquee-content scroll-right items-center">
            {row2.map((img, i) => (
              <div key={`orig-2-${i}`} className="h-32 sm:h-48 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center px-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mx-4 sm:mx-8">
                <img src={img} alt="Bg" className="h-full w-auto object-contain max-w-[250px] sm:max-w-[400px]" />
              </div>
            ))}
          </div>
          <div className="marquee-content scroll-right items-center" aria-hidden="true">
            {row2.map((img, i) => (
              <div key={`dup-2-${i}`} className="h-32 sm:h-48 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center px-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mx-4 sm:mx-8">
                <img src={img} alt="Bg" className="h-full w-auto object-contain max-w-[250px] sm:max-w-[400px]" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Gradient overlays to blend with background very subtly */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, var(--bg-primary) 100%)' }} />
    </div>
  );
};

const Hero = () => {
  const { t, i18n } = useTranslation();
  const { config, hero, dashboardStats, liveActivity, loading } = useData();
  const isEn = i18n.language === 'en';
  
  const typingRoles = config?.typingRoles || ['Web Developer', 'UI/UX Designer', 'Video Editor', 'AI Builder', 'Freelancer'];
  const activeActivity = liveActivity?.find?.(a => a.isActive);
  const siteName = config?.siteName || 'MVD Tech';

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('localhost')) {
      return url.replace('localhost', window.location.hostname);
    }
    return url;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
      <MarqueeBackground images1={hero?.marquee1?.images?.map(getImageUrl)} images2={hero?.marquee2?.images?.map(getImageUrl)} speed={hero?.marqueeSpeed || 40} />
      
      {/* Content */}
      <div className="container-main relative z-10 py-32 flex flex-col items-center justify-center min-h-screen text-center text-glow">
          {/* Live Activity Badge */}
        {activeActivity && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm"
            style={{
              background: 'var(--accent-muted)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            {isEn ? (activeActivity.textEn || activeActivity.text) : activeActivity.text}
          </motion.div>
        )}

        {/* Avatar */}
        {hero?.avatar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 inline-block"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden gradient-border mx-auto" 
              style={{ padding: '3px' }}>
              <img 
                src={getImageUrl(hero.avatar)} 
                alt={siteName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </motion.div>
        )}

        {/* Greeting + Name */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl sm:text-2xl mb-4 font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {isEn ? (hero?.greetingEn || t('hero.greeting')) : (hero?.greeting || t('hero.greeting'))}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black mb-6 spectral-text tracking-tight"
        >
          {isEn ? (hero?.titleEn || siteName) : (hero?.title || siteName)}
        </motion.h1>

        {/* Typing Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-2xl sm:text-3xl md:text-4xl mb-8 h-12 flex items-center justify-center"
        >
          <TypingAnimation roles={typingRoles} />
        </motion.div>

        {/* Subtitle/Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--text-primary)', opacity: 0.9 }}
        >
          {isEn ? (hero?.subtitleEn || config?.sloganEn || 'Creating world-class digital experiences') : (hero?.subtitle || config?.slogan || 'Tạo ra những trải nghiệm số đẳng cấp')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to={hero?.ctaPrimary?.link || '/portfolio'}
            className="btn-primary"
          >
            {hero?.ctaPrimary?.text || t('hero.cta_portfolio')}
          </Link>
          <Link
            to={hero?.ctaSecondary?.link || '/contact'}
            className="btn-secondary"
          >
            {hero?.ctaSecondary?.text || t('hero.cta_contact')}
          </Link>
        </motion.div>

        {/* Dashboard Stats */}
        {dashboardStats && (dashboardStats.projectsCompleted > 0 || dashboardStats.yearsExperience > 0 || dashboardStats.technologiesUsed > 0 || dashboardStats.clientsServed > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="glass rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto mt-12 w-full"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {dashboardStats.projectsCompleted > 0 && (
                <StatItem value={dashboardStats.projectsCompleted} label={t('common.projects_completed')} delay={1200} />
              )}
              {dashboardStats.yearsExperience > 0 && (
                <StatItem value={dashboardStats.yearsExperience} label={t('common.years_experience')} delay={1400} />
              )}
              {dashboardStats.technologiesUsed > 0 && (
                <StatItem value={dashboardStats.technologiesUsed} label={t('common.technologies')} delay={1600} />
              )}
              {dashboardStats.clientsServed > 0 && (
                <StatItem value={dashboardStats.clientsServed} label={t('common.clients')} delay={1800} />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 z-10" 
        style={{ background: `linear-gradient(transparent, var(--bg-primary))` }} />
    </section>
  );
};

export default Hero;
