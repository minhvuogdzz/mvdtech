import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  greeting: { type: String, default: 'Xin chào, tôi là' },
  greetingEn: { type: String, default: 'Hello, I am' },
  title: { type: String, default: 'Building Digital Experiences' },
  titleEn: { type: String, default: 'Building Digital Experiences' },
  subtitle: { type: String, default: 'Tạo ra những trải nghiệm số đẳng cấp, từ website đến ứng dụng AI' },
  subtitleEn: { type: String, default: 'Creating premium digital experiences, from websites to AI applications' },
  
  // Avatar/profile image
  avatar: { type: String, default: '' },
  
  // Background images for mesh effect
  backgroundImages: [{ type: String }],
  backgroundMusic: { type: String, default: '' },
  
  // CTA buttons
  ctaPrimary: {
    text: { type: String, default: 'Xem Portfolio' },
    textEn: { type: String, default: 'View Portfolio' },
    link: { type: String, default: '/portfolio' }
  },
  ctaSecondary: {
    text: { type: String, default: 'Liên hệ ngay' },
    textEn: { type: String, default: 'Contact Now' },
    link: { type: String, default: '/contact' }
  },

  // Marquee sections
  marqueeSpeed: { type: Number, default: 40 },
  marquee1: {
    images: [{ type: String }]
  },
  marquee2: {
    images: [{ type: String }]
  },
}, { timestamps: true });

export default mongoose.model('Hero', HeroSchema);
