import { useNavigate } from 'react-router-dom';

const BlogDetail = () => {
  const navigate = useNavigate();
  return (
    <div className="pt-nav min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Bài viết sẽ sớm được cập nhật</h2>
        <button onClick={() => navigate(-1)} className="btn-primary">← Quay lại</button>
      </div>
    </div>
  );
};

export default BlogDetail;
