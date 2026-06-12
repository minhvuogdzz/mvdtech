import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';

const PortfolioDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { portfolio } = useData();
  const item = (portfolio || []).find(p => p.slug === slug || p._id === slug);

  if (!item) {
    return (
      <div className="pt-nav min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Dự án không tìm thấy</h2>
          <button onClick={() => navigate(-1)} className="btn-primary">← Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-nav min-h-screen">
      <section className="section-padding">
        <div className="container-main max-w-4xl">
          <button onClick={() => navigate(-1)} className="mb-6 text-sm flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
            ← Quay lại
          </button>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {item.coverImage && (
              <img src={item.coverImage} alt={item.title} className="w-full rounded-2xl mb-8 object-cover" style={{ maxHeight: '500px' }} />
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge">{item.category}</span>
              {item.technologies?.map((t, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{t}</span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{item.title}</h1>
            
            {item.description && (
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {item.role && (
                <div className="glass-card p-4 text-center">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Vai trò</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.role}</p>
                </div>
              )}
              {item.duration && (
                <div className="glass-card p-4 text-center">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Thời gian</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.duration}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {item.liveUrl && (
                <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">🌐 Live Demo</a>
              )}
              {item.githubUrl && (
                <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">📂 GitHub</a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioDetail;
