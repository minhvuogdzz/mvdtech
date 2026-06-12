import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, default: '' },
  
  category: { 
    type: String, 
    required: true, 
    enum: ['Frontend', 'Backend', 'Design', 'DevOps', 'AI/ML', 'Tools', 'Other'] 
  },
  
  level: { type: Number, default: 50, min: 0, max: 100 },
  icon: { type: String, default: '' },
  
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Skill', SkillSchema);
