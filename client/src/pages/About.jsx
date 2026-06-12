import { useData } from '../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const About = () => {
  const { t, i18n } = useTranslation();
  const { about, loading } = useData();

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-section font-bold mb-8 gradient-text">
            {t('nav.about')}
          </motion.h1>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {about?.name || 'MVD Tech'}
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {(i18n.language === 'en' ? about?.descriptionEn : about?.description) || 'Thông tin sẽ được cập nhật qua Admin Dashboard.'}
            </p>
            
            {about?.education && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>🎓 Học vấn</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{about.education}</p>
              </div>
            )}

            {about?.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--accent)' }}>🛠 Kỹ năng</h3>
                <div className="flex flex-wrap gap-2">
                  {about.skills.map((skill, i) => (
                    <span key={i} className="badge">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
