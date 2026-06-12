import { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [allData, setAllData] = useState({});
  const [formData, setFormData] = useState({});
  const [dataList, setDataList] = useState([]);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminToken')) setIsAuth(true);
  }, []);

  useEffect(() => {
    if (isAuth) fetchAll();
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    const data = allData[activeTab];
    if (Array.isArray(data)) {
      setDataList(data);
      setFormData({});
    } else {
      setDataList([]);
      setFormData(data || {});
    }
    setMessage('');
  }, [activeTab, allData, isAuth]);

  const fetchAll = async () => {
    try {
      const eps = ['config', 'hero', 'portfolio', 'services', 'about', 'testimonials', 'faq', 'skills', 'timeline', 'live-activity', 'dashboard-stats', 'blog'];
      const res = await Promise.all(eps.map(ep => api.get(`/${ep}`).catch(() => ({ data: null }))));
      const d = {};
      const keys = ['config', 'hero', 'portfolio', 'services', 'about', 'testimonials', 'faq', 'skills', 'timeline', 'liveActivity', 'dashboardStats', 'blog'];
      eps.forEach((_, i) => { d[keys[i]] = res[i].data?.data || res[i].data; }); // some endpoints return {data: [...]}, some return [...]
      setAllData(d);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { password });
      if (data.success) { localStorage.setItem('adminToken', data.token); setIsAuth(true); }
    } catch { setError('Mật khẩu không chính xác'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const epMap = { liveActivity: 'live-activity', dashboardStats: 'dashboard-stats' };
      const ep = epMap[activeTab] || activeTab;
      await api.post(`/${ep}`, formData);
      setMessage('✅ Đã lưu thành công!');
      setIsModalOpen(false);
      fetchAll();
    } catch { setMessage('❌ Lỗi khi lưu!'); }
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMessage('⏳ Đang tải ảnh lên và nén...');
    const fd = new FormData();
    fd.append('image', file);
    
    try {
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, [key]: data.url });
      setMessage('✅ Tải ảnh lên thành công!');
    } catch (err) {
      setMessage('❌ Lỗi khi tải ảnh: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa?')) return;
    try {
      const epMap = { liveActivity: 'live-activity', dashboardStats: 'dashboard-stats' };
      const ep = epMap[activeTab] || activeTab;
      await api.delete(`/${ep}/${id}`);
      setMessage('✅ Đã xóa!');
      fetchAll();
    } catch { setMessage('❌ Lỗi!'); }
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all";
  const inputProps = { style: { background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' } };

  if (!isAuth) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="glass-card p-10 w-full max-w-[400px]">
          <h2 className="mb-6 text-center text-2xl font-bold gradient-text">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Nhập mật mã" value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputStyle} {...inputProps} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full">Xác minh</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'config', label: '⚙️ Cấu hình' },
    { id: 'hero', label: '🏠 Trang chủ' },
    { id: 'portfolio', label: '📂 Portfolio' },
    { id: 'services', label: '💼 Dịch vụ' },
    { id: 'about', label: '👤 Giới thiệu' },
    { id: 'skills', label: '🛠 Kỹ năng' },
    { id: 'faq', label: '❓ FAQ' },
    { id: 'testimonials', label: '⭐ Đánh giá' },
    { id: 'timeline', label: '📅 Timeline' },
    { id: 'blog', label: '📝 Blog' },
    { id: 'liveActivity', label: '🟢 Live Activity' },
    { id: 'dashboardStats', label: '📊 Dashboard Stats' },
  ];

  const isList = ['portfolio', 'services', 'testimonials', 'faq', 'skills', 'timeline', 'liveActivity', 'blog'].includes(activeTab);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-[250px] min-h-screen border-r flex flex-col p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-bold mb-6 gradient-text">MVD Tech Admin</h3>
        <div className="flex flex-col gap-1 flex-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-3 py-2.5 text-left rounded-lg text-sm transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--accent-muted)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={() => { localStorage.removeItem('adminToken'); setIsAuth(false); }}
          className="px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors">
          Đăng xuất
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        {message && <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{message}</div>}

        <div className="glass-card p-6">
          {isList ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Danh sách ({dataList.length})</h3>
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="btn-primary text-sm py-2">+ Thêm mới</button>
              </div>
              {dataList.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-2">
                  {dataList.map((item, i) => (
                    <div key={item._id || i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.title || item.name || item.question || item.text || item.customerName || `Mục ${i + 1}`}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setFormData(item); setIsModalOpen(true); }} className="text-xs px-3 py-1 rounded-lg" style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}>Sửa</button>
                        {item._id && <button onClick={() => handleDelete(item._id)} className="text-xs px-3 py-1 rounded-lg text-red-400 border border-red-400">Xóa</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {activeTab === 'config' && (
                <>
                  <input placeholder="Tên Website" value={formData.siteName || ''} onChange={e => setFormData({...formData, siteName: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Slogan" value={formData.slogan || ''} onChange={e => setFormData({...formData, slogan: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Footer Text" value={formData.footerText || ''} onChange={e => setFormData({...formData, footerText: e.target.value})} className={inputStyle} {...inputProps} />
                  <div className="pt-2">
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Typing Roles (phẩy cách)</label>
                    <input placeholder="Web Developer, UI/UX Designer..." value={(formData.typingRoles || []).join(', ')} onChange={e => setFormData({...formData, typingRoles: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className={inputStyle} {...inputProps} />
                  </div>
                  <div className="pt-2">
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Social Links (JSON)</label>
                    <textarea rows={4} value={formData.socialLinks ? JSON.stringify(formData.socialLinks, null, 2) : '{\n  "github": "",\n  "facebook": "",\n  "linkedin": "",\n  "email": "",\n  "phone": ""\n}'} onChange={e => { try { setFormData({...formData, socialLinks: JSON.parse(e.target.value)}) } catch {} }} className={inputStyle + ' font-mono text-xs'} {...inputProps} />
                  </div>
                </>
              )}
              {activeTab === 'hero' && (
                <>
                  <input placeholder="Lời chào (VD: Xin chào, tôi là)" value={formData.greeting || ''} onChange={e => setFormData({...formData, greeting: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Lời chào (Tiếng Anh)" value={formData.greetingEn || ''} onChange={e => setFormData({...formData, greetingEn: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Tiêu đề chính" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Tiêu đề chính (Tiếng Anh)" value={formData.titleEn || ''} onChange={e => setFormData({...formData, titleEn: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Subtitle" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Subtitle (Tiếng Anh)" value={formData.subtitleEn || ''} onChange={e => setFormData({...formData, subtitleEn: e.target.value})} className={inputStyle} {...inputProps} />
                  <div className="flex gap-2 items-center">
                    <input placeholder="Avatar URL" value={formData.avatar || ''} onChange={e => setFormData({...formData, avatar: e.target.value})} className={inputStyle} {...inputProps} />
                    <label className="btn-secondary px-4 py-3 rounded-xl cursor-pointer whitespace-nowrap text-sm flex-shrink-0">
                      Tải lên
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'avatar')} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>CTA Primary Text</label>
                      <input value={formData.ctaPrimary?.text || ''} onChange={e => setFormData({...formData, ctaPrimary: { ...formData.ctaPrimary, text: e.target.value }})} className={inputStyle} {...inputProps} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>CTA Primary Link</label>
                      <input value={formData.ctaPrimary?.link || ''} onChange={e => setFormData({...formData, ctaPrimary: { ...formData.ctaPrimary, link: e.target.value }})} className={inputStyle} {...inputProps} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>CTA Secondary Text</label>
                      <input value={formData.ctaSecondary?.text || ''} onChange={e => setFormData({...formData, ctaSecondary: { ...formData.ctaSecondary, text: e.target.value }})} className={inputStyle} {...inputProps} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>CTA Secondary Link</label>
                      <input value={formData.ctaSecondary?.link || ''} onChange={e => setFormData({...formData, ctaSecondary: { ...formData.ctaSecondary, link: e.target.value }})} className={inputStyle} {...inputProps} />
                    </div>
                  </div>

                  {/* Marquee 1 Section */}
                  <div className="pt-6 border-t mt-6" style={{ borderColor: 'var(--glass-border)' }}>
                    <h4 className="font-bold mb-4 flex justify-between items-center" style={{ color: 'var(--accent)' }}>
                      Marquee Background (Hàng trên)
                      <div className="flex items-center gap-2 text-sm font-normal">
                        <label>Tốc độ (s):</label>
                        <input type="number" value={formData.marqueeSpeed || 40} onChange={e => setFormData({...formData, marqueeSpeed: parseInt(e.target.value) || 40})} className="px-2 py-1 rounded-md w-16 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                      </div>
                    </h4>
                    
                    <div className="mt-4">
                      <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Danh sách ảnh</label>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {(formData.marquee1?.images || []).map((imgUrl, idx) => (
                          <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                            <img src={imgUrl} alt={`Marquee1 ${idx}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setFormData({...formData, marquee1: { ...formData.marquee1, images: formData.marquee1.images.filter((_, i) => i !== idx) }})} 
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">
                              Xóa
                            </button>
                          </div>
                        ))}
                        <label className="w-24 h-24 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                          <span className="text-2xl">+</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setMessage('⏳ Đang tải ảnh lên...');
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              setFormData({...formData, marquee1: { ...formData.marquee1, images: [...(formData.marquee1?.images || []), data.url] }});
                              setMessage('✅ Tải ảnh lên thành công!');
                            } catch (err) {
                              setMessage('❌ Lỗi khi tải ảnh: ' + (err.response?.data?.error || err.message));
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Marquee 2 Section */}
                  <div className="pt-6 border-t mt-6" style={{ borderColor: 'var(--glass-border)' }}>
                    <h4 className="font-bold mb-4" style={{ color: 'var(--accent)' }}>Marquee Background (Hàng dưới)</h4>
                    
                    <div className="mt-4">
                      <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Danh sách ảnh</label>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {(formData.marquee2?.images || []).map((imgUrl, idx) => (
                          <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                            <img src={imgUrl} alt={`Marquee2 ${idx}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setFormData({...formData, marquee2: { ...formData.marquee2, images: formData.marquee2.images.filter((_, i) => i !== idx) }})} 
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">
                              Xóa
                            </button>
                          </div>
                        ))}
                        <label className="w-24 h-24 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                          <span className="text-2xl">+</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setMessage('⏳ Đang tải ảnh lên...');
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              setFormData({...formData, marquee2: { ...formData.marquee2, images: [...(formData.marquee2?.images || []), data.url] }});
                              setMessage('✅ Tải ảnh lên thành công!');
                            } catch (err) {
                              setMessage('❌ Lỗi khi tải ảnh: ' + (err.response?.data?.error || err.message));
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'about' && (
                <>
                  <input placeholder="Tên" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} {...inputProps} />
                  <textarea placeholder="Mô tả" rows={4} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} {...inputProps} />
                  <textarea placeholder="Mô tả (Tiếng Anh)" rows={4} value={formData.descriptionEn || ''} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Học vấn" value={formData.education || ''} onChange={e => setFormData({...formData, education: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="Kỹ năng chính (phẩy cách)" value={(formData.skills || []).join(', ')} onChange={e => setFormData({...formData, skills: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className={inputStyle} {...inputProps} />
                </>
              )}
              {activeTab === 'dashboardStats' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Dự án hoàn thành</label>
                    <input type="number" value={formData.projectsCompleted || 0} onChange={e => setFormData({...formData, projectsCompleted: parseInt(e.target.value) || 0})} className={inputStyle} {...inputProps} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Năm kinh nghiệm</label>
                    <input type="number" value={formData.yearsExperience || 0} onChange={e => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})} className={inputStyle} {...inputProps} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Công nghệ sử dụng</label>
                    <input type="number" value={formData.technologiesUsed || 0} onChange={e => setFormData({...formData, technologiesUsed: parseInt(e.target.value) || 0})} className={inputStyle} {...inputProps} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Khách hàng</label>
                    <input type="number" value={formData.clientsServed || 0} onChange={e => setFormData({...formData, clientsServed: parseInt(e.target.value) || 0})} className={inputStyle} {...inputProps} />
                  </div>
                </div>
              )}
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full">Lưu thay đổi</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="glass-card w-full max-w-[600px] p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 gradient-text">{formData._id ? 'Chỉnh sửa' : 'Thêm mới'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              {activeTab === 'portfolio' && (
                <>
                  <input placeholder="Tiêu đề" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} {...inputProps} required />
                  <select value={formData.category || 'Web Development'} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle} {...inputProps}>
                    {['Web Development', 'Mobile App', 'AI/ML', 'UI/UX Design', 'Photoshop', 'Video Editing', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="Mô tả" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} {...inputProps} />
                  <div className="flex gap-2 items-center">
                    <input placeholder="Cover Image URL" value={formData.coverImage || ''} onChange={e => setFormData({...formData, coverImage: e.target.value})} className={inputStyle} {...inputProps} />
                    <label className="btn-secondary px-4 py-3 rounded-xl cursor-pointer whitespace-nowrap text-sm flex-shrink-0">
                      Tải lên
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'coverImage')} />
                    </label>
                  </div>
                  <input placeholder="Technologies (phẩy cách)" value={(formData.technologies || []).join(', ')} onChange={e => setFormData({...formData, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className={inputStyle} {...inputProps} />
                  <input placeholder="Live URL" value={formData.liveUrl || ''} onChange={e => setFormData({...formData, liveUrl: e.target.value})} className={inputStyle} {...inputProps} />
                  <input placeholder="GitHub URL" value={formData.githubUrl || ''} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className={inputStyle} {...inputProps} />
                </>
              )}
              {activeTab === 'services' && (
                <>
                  <input placeholder="Tên dịch vụ" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} {...inputProps} required />
                  <select value={formData.category || 'Web Development'} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle} {...inputProps}>
                    {['Web Development', 'Design', 'Photoshop', 'Video Editing', 'AI', 'Consulting', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="Giá" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className={inputStyle} {...inputProps} />
                  <textarea placeholder="Mô tả" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} {...inputProps} rows={3} />
                </>
              )}
              {activeTab === 'skills' && (
                <>
                  <input placeholder="Tên kỹ năng" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} {...inputProps} required />
                  <select value={formData.category || 'Frontend'} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle} {...inputProps}>
                    {['Frontend', 'Backend', 'Design', 'DevOps', 'AI/ML', 'Tools', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div>
                    <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mức độ: {formData.level || 50}%</label>
                    <input type="range" min="0" max="100" value={formData.level || 50} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full" />
                  </div>
                </>
              )}
              {activeTab === 'faq' && (
                <>
                  <input placeholder="Câu hỏi" value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className={inputStyle} {...inputProps} required />
                  <textarea placeholder="Câu trả lời" rows={4} value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className={inputStyle} {...inputProps} required />
                </>
              )}
              {activeTab === 'testimonials' && (
                <>
                  <input placeholder="Tên khách hàng" value={formData.customerName || ''} onChange={e => setFormData({...formData, customerName: e.target.value})} className={inputStyle} {...inputProps} required />
                  <textarea placeholder="Nhận xét" value={formData.quote || ''} onChange={e => setFormData({...formData, quote: e.target.value})} className={inputStyle} {...inputProps} required />
                </>
              )}
              {activeTab === 'timeline' && (
                <>
                  <input placeholder="Tiêu đề" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} {...inputProps} required />
                  <textarea placeholder="Mô tả" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} {...inputProps} />
                  <input type="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, date: e.target.value})} className={inputStyle} {...inputProps} required />
                </>
              )}
              {activeTab === 'liveActivity' && (
                <>
                  <input placeholder="Nội dung (VD: Đang phát triển dự án React)" value={formData.text || ''} onChange={e => setFormData({...formData, text: e.target.value})} className={inputStyle} {...inputProps} required />
                  <select value={formData.type || 'working'} onChange={e => setFormData({...formData, type: e.target.value})} className={inputStyle} {...inputProps}>
                    {['working', 'learning', 'latest_post', 'available'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={formData.isActive ?? true} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    Đang hoạt động
                  </label>
                </>
              )}
              {activeTab === 'blog' && (
                <>
                  <input placeholder="Tiêu đề bài viết" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} {...inputProps} required />
                  <input placeholder="Slug (Tự động hoặc nhập tay)" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} className={inputStyle} {...inputProps} />
                  <textarea placeholder="Đoạn trích (Excerpt)" value={formData.excerpt || ''} onChange={e => setFormData({...formData, excerpt: e.target.value})} className={inputStyle} {...inputProps} rows={3} />
                  <div className="flex gap-2 items-center">
                    <input placeholder="Cover Image URL" value={formData.coverImage || ''} onChange={e => setFormData({...formData, coverImage: e.target.value})} className={inputStyle} {...inputProps} />
                    <label className="btn-secondary px-4 py-3 rounded-xl cursor-pointer whitespace-nowrap text-sm flex-shrink-0">
                      Tải lên
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'coverImage')} />
                    </label>
                  </div>
                  <textarea placeholder="Nội dung HTML hoặc Markdown" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className={inputStyle + " font-mono text-xs h-64"} {...inputProps} required />
                  <input placeholder="Tags (phẩy cách)" value={(formData.tags || []).join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className={inputStyle} {...inputProps} />
                  <select value={formData.status || 'draft'} onChange={e => setFormData({...formData, status: e.target.value})} className={inputStyle} {...inputProps}>
                    <option value="draft">Nháp (Draft)</option>
                    <option value="published">Xuất bản (Published)</option>
                  </select>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" className="btn-primary flex-1">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
