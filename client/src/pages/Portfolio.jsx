import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SkeletonCard } from '../components/common/Skeleton';

const Portfolio = () => {
  const { t } = useTranslation();
  const { portfolio, loading } = useData();
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', ...new Set((portfolio || []).map(p => p.category))];
  const filtered = activeFilter === 'All' ? portfolio : (portfolio || []).filter(p => p.category === activeFilter);

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-section font-bold mb-8 gradient-text">
            {t('nav.portfolio')}
          </motion.h1>

          {/* Filter bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeFilter === cat ? 'var(--accent)' : 'var(--accent-muted)',
                  color: activeFilter === cat ? 'white' : 'var(--text-secondary)',
                }}
              >
                {cat === 'All' ? t('common.filter_all') : cat}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-16" style={{ color: 'var(--text-secondary)' }}>
                {t('common.no_data')}
              </div>
            ) : (
              filtered.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Link to={`/portfolio/${item.slug || item._id}`} className="block group">
                    <div className="glass-card overflow-hidden">
                      <div className="aspect-video overflow-hidden relative">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                            <span className="text-4xl">🚀</span>
                          </div>
                        )}
                        <span className="absolute top-3 left-3 badge">{item.category}</span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                        {item.description && (
                          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                        )}
                        {item.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.technologies.slice(0, 5).map((tech, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
