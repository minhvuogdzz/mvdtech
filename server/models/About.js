import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  title: { type: String, default: 'Về tôi' },
  titleEn: { type: String, default: 'About Me' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  education: { type: String, default: '' },
  educationEn: { type: String, default: '' },
  skills: [{ type: String }],
  images: [{ type: String }],
  resumeUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('About', AboutSchema);
