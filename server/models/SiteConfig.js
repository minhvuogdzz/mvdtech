import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema({
  siteName: { type: String, default: 'MVD Tech' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  slogan: { type: String, default: 'Code. Design. Create.' },
  accentColor: { type: String, default: '#3b82f6' },
  
  // Typing animation roles
  typingRoles: {
    type: [String],
    default: ['Web Developer', 'UI/UX Designer', 'Video Editor', 'AI Builder', 'Freelancer']
  },
  
  // Social links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    zalo: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  
  // Navigation items
  navLinks: [{
    label: { type: String },
    labelEn: { type: String },
    href: { type: String },
    icon: { type: String },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  
  footerText: { type: String, default: '© 2024 MVD Tech. All rights reserved.' },
  
  // SEO defaults
  seoDefaults: {
    title: { type: String, default: 'MVD Tech - Personal Digital Hub' },
    description: { type: String, default: 'Web Developer, UI/UX Designer, Video Editor, AI Builder & Freelancer' },
    ogImage: { type: String, default: '' },
    keywords: { type: String, default: 'web developer, designer, freelancer, portfolio' }
  },
  
  // i18n
  defaultLanguage: { type: String, default: 'vi', enum: ['vi', 'en'] },
}, { timestamps: true });

export default mongoose.model('SiteConfig', SiteConfigSchema);
