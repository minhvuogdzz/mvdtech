import { useData } from '../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Skills = () => {
  const { t } = useTranslation();
  const { skills } = useData();

  const categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'AI/ML', 'Tools', 'Other'];
  const grouped = categories.reduce((acc, cat) => {
    const items = (skills || []).filter(s => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-section font-bold mb-12 gradient-text">
            {t('nav.skills')}
          </motion.h1>

          {Object.keys(grouped).length === 0 ? (
            <div className="glass-card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
              {t('common.no_data')} — Thêm kỹ năng qua Admin Dashboard
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(grouped).map(([category, items], catIdx) => (
                <motion.div key={category} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: catIdx * 0.1 }}>
                  <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((skill, idx) => (
                      <div key={skill._id || idx} className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</span>
                          <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{skill.level}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-gradient)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Skills;
