import { useData } from '../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Services = () => {
  const { t } = useTranslation();
  const { services } = useData();
  const items = (services || []).filter(s => s.enabled !== false);

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-section font-bold mb-12 gradient-text">
            {t('nav.services')}
          </motion.h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 sm:p-8 relative overflow-hidden group"
              >
                {item.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent-gradient)' }}>
                    {item.badge}
                  </span>
                )}
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-5" loading="lazy" />
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                <p className="text-lg font-bold mb-4 gradient-text">{item.price}</p>
                {item.features?.length > 0 && (
                  <ul className="space-y-2">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
