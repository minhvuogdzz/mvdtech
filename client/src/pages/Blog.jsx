import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Blog = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-section font-bold mb-12 gradient-text">
            {t('nav.blog')}
          </motion.h1>
          <div className="glass-card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            Tính năng Blog sẽ sớm được cập nhật. Thêm bài viết qua Admin Dashboard.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
