import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String, default: '' },
  slug: { type: String, unique: true },
  
  content: { type: String, default: '' },
  contentEn: { type: String, default: '' },
  
  excerpt: { type: String, default: '' },
  excerptEn: { type: String, default: '' },
  
  coverImage: { type: String, default: '' },
  
  tags: [{ type: String }],
  
  status: { type: String, default: 'draft', enum: ['draft', 'published'] },
  
  author: { type: String, default: 'MVD Tech' },
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  
  publishedAt: { type: Date },
  
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  }
}, { timestamps: true });

// Auto-generate slug from title
BlogSchema.pre('save', function() {
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
  
  // Auto-calc read time from content
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  
  // Auto-set publishedAt
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export default mongoose.model('Blog', BlogSchema);
