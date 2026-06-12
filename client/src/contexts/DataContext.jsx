import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const DataContext = createContext();

const DEFAULT_CONFIG = {
  siteName: 'MVD Tech',
  slogan: 'Code. Design. Create.',
  typingRoles: ['Web Developer', 'UI/UX Designer', 'Video Editor', 'AI Builder', 'Freelancer'],
  socialLinks: {},
  navLinks: [
    { label: 'Trang chủ', labelEn: 'Home', href: '/', enabled: true },
    { label: 'Giới thiệu', labelEn: 'About', href: '/about', enabled: true },
    { label: 'Kỹ năng', labelEn: 'Skills', href: '/skills', enabled: true },
    { label: 'Dự án', labelEn: 'Portfolio', href: '/portfolio', enabled: true },
    { label: 'Dịch vụ', labelEn: 'Services', href: '/services', enabled: true },
    { label: 'Blog', labelEn: 'Blog', href: '/blog', enabled: true },
    { label: 'Liên hệ', labelEn: 'Contact', href: '/contact', enabled: true },
  ],
  seoDefaults: { title: 'MVD Tech', description: '' },
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    config: DEFAULT_CONFIG,
    hero: null,
    portfolio: [],
    services: [],
    about: null,
    testimonials: [],
    faq: [],
    skills: [],
    timeline: [],
    liveActivity: [],
    dashboardStats: null,
    blog: [],
  });
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const endpoints = [
        'config', 'hero', 'portfolio', 'services', 'about',
        'testimonials', 'faq', 'skills', 'timeline',
        'live-activity', 'dashboard-stats'
      ];
      
      const responses = await Promise.all(
        endpoints.map(ep => api.get(`/${ep}`).catch(() => ({ data: null })))
      );
      
      const newData = {};
      const keys = [
        'config', 'hero', 'portfolio', 'services', 'about',
        'testimonials', 'faq', 'skills', 'timeline',
        'liveActivity', 'dashboardStats'
      ];
      
      endpoints.forEach((_, i) => {
        const d = responses[i].data;
        if (keys[i] === 'config') {
          newData[keys[i]] = d && Object.keys(d).length > 0 ? { ...DEFAULT_CONFIG, ...d } : DEFAULT_CONFIG;
        } else {
          newData[keys[i]] = d || (Array.isArray(data[keys[i]]) ? [] : null);
        }
      });
      
      setData(prev => ({ ...prev, ...newData }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Socket.IO real-time sync
  useEffect(() => {
    const connect = async () => {
      try {
        const { io } = await import('socket.io-client');
        const getSocketUrl = () => {
          if (import.meta.env.PROD && import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace('/api', '');
          return `http://${window.location.hostname}:5001`;
        };
        const url = getSocketUrl();
        
        const isAdmin = localStorage.getItem('adminToken') || window.location.pathname.includes('admin');
        let sessionId = sessionStorage.getItem('mvd_session');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('mvd_session', sessionId);
        }

        socketRef.current = io(url, {
          transports: ['websocket', 'polling'],
          query: isAdmin ? { type: 'admin' } : { sessionId, type: 'visitor' },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        socketRef.current.on('data-updated', () => fetchAllData());
      } catch (err) {
        console.warn('Socket.IO not available');
      }
    };

    connect();
    return () => socketRef.current?.disconnect();
  }, [fetchAllData]);

  const refetch = useCallback((section) => {
    if (section) {
      api.get(`/${section}`).then(({ data: d }) => {
        setData(prev => ({ ...prev, [section]: d }));
      }).catch(console.error);
    } else {
      fetchAllData();
    }
  }, [fetchAllData]);

  return (
    <DataContext.Provider value={{ ...data, loading, refetch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
