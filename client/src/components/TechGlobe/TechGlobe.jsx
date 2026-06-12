import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';

const Globe = React.lazy(() => import('react-globe.gl'));

const HANOI = { lat: 21.0285, lng: 105.8542 };
const SF = { lat: 37.7749, lng: -122.4194 };
const TOKYO = { lat: 35.6762, lng: 139.6503 };
const LONDON = { lat: 51.5074, lng: -0.1278 };
const NY = { lat: 40.7128, lng: -74.0060 };
const SINGAPORE = { lat: 1.3521, lng: 103.8198 };
const SYDNEY = { lat: -33.8688, lng: 151.2093 };
const SEOUL = { lat: 37.5665, lng: 126.978 };

const arcsData = [
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: SF.lat, endLng: SF.lng, color: ['rgba(0,255,100,0.6)', 'rgba(255,0,255,0.6)'] },
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: TOKYO.lat, endLng: TOKYO.lng, color: ['rgba(0,255,100,0.6)', 'rgba(0,255,255,0.6)'] },
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: LONDON.lat, endLng: LONDON.lng, color: ['rgba(0,255,100,0.6)', 'rgba(255,170,0,0.6)'] },
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: NY.lat, endLng: NY.lng, color: ['rgba(0,255,100,0.6)', 'rgba(255,0,85,0.6)'] },
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: SINGAPORE.lat, endLng: SINGAPORE.lng, color: ['rgba(0,255,100,0.6)', 'rgba(255,255,0,0.6)'] },
  { startLat: HANOI.lat, startLng: HANOI.lng, endLat: SYDNEY.lat, endLng: SYDNEY.lng, color: ['rgba(0,255,100,0.6)', 'rgba(0,136,255,0.6)'] },
  { startLat: SF.lat, startLng: SF.lng, endLat: TOKYO.lat, endLng: TOKYO.lng, color: ['rgba(255,0,255,0.3)', 'rgba(0,255,255,0.3)'] },
  { startLat: LONDON.lat, startLng: LONDON.lng, endLat: NY.lat, endLng: NY.lng, color: ['rgba(255,170,0,0.3)', 'rgba(255,0,85,0.3)'] },
];

const satellitesData = [
  { lat: 10, lng: 30, alt: 0.35, name: 'ChatGPT', icon: '🤖', type: 'ai' },
  { lat: -15, lng: 120, alt: 0.3, name: 'Gemini', icon: '✨', type: 'ai' },
  { lat: 35, lng: -80, alt: 0.4, name: 'Claude', icon: '🧠', type: 'ai' },
  { lat: 50, lng: 10, alt: 0.28, name: 'Midjourney', icon: '🎨', type: 'ai' },
  { lat: -30, lng: -60, alt: 0.33, name: 'Copilot', icon: '💻', type: 'ai' },
  { lat: -20, lng: -40, alt: 0.36, name: 'TikTok', icon: '🎵', type: 'social' },
  { lat: 20, lng: -140, alt: 0.3, name: 'Facebook', icon: '📘', type: 'social' },
  { lat: 5, lng: 160, alt: 0.38, name: 'Shopee', icon: '🛒', type: 'ecom' },
  { lat: -10, lng: 60, alt: 0.32, name: 'Amazon', icon: '📦', type: 'ecom' },
  { lat: 45, lng: 90, alt: 0.34, name: 'YouTube', icon: '▶️', type: 'social' },
  { lat: HANOI.lat, lng: HANOI.lng, alt: 0.08, name: '🇻🇳 Hà Nội', icon: '📍', type: 'location' },
  { lat: 25, lng: -45, alt: 0.6, name: 'ISS', icon: '🛰️', type: 'location' },
];

const labelsData = [
  { lat: HANOI.lat, lng: HANOI.lng, text: 'Hà Nội', color: '#ffff00', size: 1.2 },
  { lat: SF.lat, lng: SF.lng, text: 'Silicon Valley', color: '#ff00ff', size: 0.8 },
  { lat: TOKYO.lat, lng: TOKYO.lng, text: 'Tokyo', color: '#00ffff', size: 0.8 },
  { lat: LONDON.lat, lng: LONDON.lng, text: 'London', color: '#ffaa00', size: 0.8 },
  { lat: NY.lat, lng: NY.lng, text: 'New York', color: '#ff0055', size: 0.8 },
  { lat: SINGAPORE.lat, lng: SINGAPORE.lng, text: 'Singapore', color: '#00ff88', size: 0.8 },
  { lat: SEOUL.lat, lng: SEOUL.lng, text: 'Seoul', color: '#aaaaff', size: 0.8 },
];

const TechGlobe = memo(() => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [canvasW, setCanvasW] = useState(600);
  const [canvasH, setCanvasH] = useState(500);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight * 0.8;
      setCanvasW(w);
      setCanvasH(Math.max(500, Math.min(h, 700)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const handleZoom = useCallback((direction) => {
    if (!globeRef.current) return;
    const currentAltitude = globeRef.current.pointOfView().altitude;
    let newAltitude = direction === 'in' ? currentAltitude - 0.4 : currentAltitude + 0.4;
    newAltitude = Math.max(1.3, Math.min(newAltitude, 3.5));
    globeRef.current.pointOfView({ altitude: newAltitude }, 500);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !globeReady) return;
    const controls = globeRef.current.controls();
    controls.enableZoom = false; // Tắt zoom chuột theo yêu cầu
    controls.minDistance = 1.3;
    controls.maxDistance = 3.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    const isMobile = window.innerWidth < 768;
    globeRef.current.pointOfView({ lat: 15, lng: 105, altitude: isMobile ? 2.5 : 1.6 }, 1500);

    const renderer = globeRef.current.renderer();
    if (renderer) {
      renderer.setPixelRatio(1);
    }
  }, [globeReady]);

  useEffect(() => {
    if (!globeRef.current || !globeReady) return;
    const controls = globeRef.current.controls();
    if (controls) controls.autoRotate = isVisible;
  }, [isVisible, globeReady]);

  const handleGlobeReady = useCallback(() => setGlobeReady(true), []);

  const createSatelliteEl = useCallback((d) => {
    const el = document.createElement('div');
    el.className = `satellite-marker ${d.type}`;
    el.innerHTML = `
      <div class="marker-glow"></div>
      <div class="marker-content"><span class="marker-icon">${d.icon}</span> ${d.name}</div>
    `;
    return el;
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full flex flex-col items-center justify-center overflow-hidden rounded-b-[2.5rem]"
      style={{
        height: '80vh',
        minHeight: '500px',
        maxHeight: '700px',
        background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.1) 0%, #050510 100%)',
      }}
    >
      {/* CSS Stars Background */}
      <div className="absolute inset-0 z-0 opacity-50" style={{
        backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0))',
        backgroundSize: '200px 200px',
      }}></div>

      <div className="absolute top-12 left-0 right-0 z-10 text-center px-4 pointer-events-none">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold spectral-text mb-4"
        >
          Kỷ nguyên công nghệ 4.0
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg max-w-xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Kết nối trí tuệ nhân tạo, nền tảng thương mại và giải trí hàng đầu thế giới từ Việt Nam.
        </motion.p>
      </div>

      <div
        className="absolute inset-0 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {isVisible && (
          <React.Suspense fallback={
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          }>
            <Globe
              ref={globeRef}
              width={canvasW}
              height={canvasH}
              onGlobeReady={handleGlobeReady}
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundColor="rgba(0,0,0,0)"
              atmosphereColor="rgba(100,180,255,0.4)"
              atmosphereAltitude={0.2}
              animateIn={true}

              arcsData={arcsData}
              arcColor="color"
              arcDashLength={0.5}
              arcDashGap={0.3}
              arcDashAnimateTime={3000}
              arcStroke={0.8}
              arcAltitudeAutoScale={0.25}

              htmlElementsData={satellitesData}
              htmlElement={createSatelliteEl}
              htmlAltitude="alt"

              labelsData={labelsData}
              labelText="text"
              labelSize="size"
              labelColor="color"
              labelDotRadius={0.4}
              labelAltitude={0.01}
              labelResolution={2}
            />
          </React.Suspense>
        )}
      </div>

      <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-20">
        <button onClick={() => handleZoom('in')} className="w-10 h-10 rounded-full bg-blue-600/30 hover:bg-blue-600/60 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-blue-400/30 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          +
        </button>
        <button onClick={() => handleZoom('out')} className="w-10 h-10 rounded-full bg-blue-600/30 hover:bg-blue-600/60 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-blue-400/30 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          -
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex flex-wrap justify-center gap-3 px-4 max-w-3xl mx-auto pointer-events-none"
      >
        {['AI', 'Blockchain', 'Cloud', 'IoT', '5G', 'Big Data', 'VR/AR', 'Cybersecurity'].map((tech) => (
          <span
            key={tech}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-mono font-semibold backdrop-blur-sm"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: 'var(--accent)',
            }}
          >
            {tech}
          </span>
        ))}
      </motion.div>
    </section>
  );
});

TechGlobe.displayName = 'TechGlobe';

export default TechGlobe;
