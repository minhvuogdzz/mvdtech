import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, default: '' },
  
  category: { 
    type: String, 
    required: true, 
    enum: ['Web Development', 'Design', 'Photoshop', 'Video Editing', 'AI', 'Consulting', 'Other'] 
  },
  
  description: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
  
  image: { type: String },
  icon: { type: String, default: '' },
  
  price: { type: String, default: 'Liên hệ' },
  priceEn: { type: String, default: 'Contact' },
  
  features: [{ type: String }],
  featuresEn: [{ type: String }],
  
  estimatedTime: { type: String, default: '' },
  estimatedTimeEn: { type: String, default: '' },
  
  badge: { type: String, default: '', enum: ['', 'Hot', 'New', 'Popular', 'Best Seller'] },
  
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
