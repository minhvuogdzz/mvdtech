import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String, default: '' },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  
  category: { 
    type: String, 
    required: true, 
    enum: ['Web Development', 'Mobile App', 'AI/ML', 'UI/UX Design', 'Photoshop', 'Video Editing', 'Other'] 
  },
  
  // Media
  coverImage: { type: String },
  images: [{ type: String }],
  demoVideo: { type: String, default: '' },
  
  // Links
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  
  // Tech & details
  technologies: [{ type: String }],
  role: { type: String, default: '' },
  roleEn: { type: String, default: '' },
  duration: { type: String, default: '' },
  durationEn: { type: String, default: '' },
  challenges: { type: String, default: '' },
  challengesEn: { type: String, default: '' },
  
  // Before/After (for design projects)
  beforeImage: { type: String, default: '' },
  afterImage: { type: String, default: '' },
  
  // Display
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  
  // Date
  completedAt: { type: Date },
}, { timestamps: true });

// Auto-generate slug from title
PortfolioSchema.pre('save', function() {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

export default mongoose.model('Portfolio', PortfolioSchema);
