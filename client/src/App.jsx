import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProgressBar from './components/common/ProgressBar';
import BackToTop from './components/common/BackToTop';
import Toast from './components/common/Toast';
import ChatbotFab from './components/Chatbot/ChatbotFab';
import CommandPalette from './components/CommandPalette/CommandPalette';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Skills = lazy(() => import('./pages/Skills'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'));
const Services = lazy(() => import('./pages/Services'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Timeline = lazy(() => import('./pages/Timeline'));

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Loading skeleton
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</span>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isNavigating, setIsNavigating] = useState(false);

  // Show progress bar on navigation
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Esc to close all popups
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-all-popups'));
      }
      // Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-command-palette'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {isNavigating && <ProgressBar />}
      
      {!isAdmin && <Header />}
      
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div {...pageVariants} key="home">
                <Home />
              </motion.div>
            } />
            <Route path="/about" element={
              <motion.div {...pageVariants} key="about">
                <About />
              </motion.div>
            } />
            <Route path="/skills" element={
              <motion.div {...pageVariants} key="skills">
                <Skills />
              </motion.div>
            } />
            <Route path="/faq" element={
              <motion.div {...pageVariants} key="faq">
                <FAQ />
              </motion.div>
            } />
            <Route path="/testimonials" element={
              <motion.div {...pageVariants} key="testimonials">
                <Testimonials />
              </motion.div>
            } />
            <Route path="/timeline" element={
              <motion.div {...pageVariants} key="timeline">
                <Timeline />
              </motion.div>
            } />
            <Route path="/portfolio" element={
              <motion.div {...pageVariants} key="portfolio">
                <Portfolio />
              </motion.div>
            } />
            <Route path="/portfolio/:slug" element={
              <motion.div {...pageVariants} key="portfolio-detail">
                <PortfolioDetail />
              </motion.div>
            } />
            <Route path="/services" element={
              <motion.div {...pageVariants} key="services">
                <Services />
              </motion.div>
            } />
            <Route path="/blog" element={
              <motion.div {...pageVariants} key="blog">
                <Blog />
              </motion.div>
            } />
            <Route path="/blog/:slug" element={
              <motion.div {...pageVariants} key="blog-detail">
                <BlogDetail />
              </motion.div>
            } />
            <Route path="/contact" element={
              <motion.div {...pageVariants} key="contact">
                <Contact />
              </motion.div>
            } />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {!isAdmin && <Footer />}
      {!isAdmin && <ChatbotFab />}
      {!isAdmin && <BackToTop />}
      <CommandPalette />
      <Toast />
    </>
  );
}

export default App;
