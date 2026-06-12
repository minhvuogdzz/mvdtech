import mongoose from 'mongoose';

const LiveActivitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  textEn: { type: String, default: '' },
  
  type: { 
    type: String, 
    default: 'working', 
    enum: ['working', 'learning', 'latest_post', 'available'] 
  },
  
  link: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('LiveActivity', LiveActivitySchema);
