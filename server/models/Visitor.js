import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  sessionId: { type: String },
  ip: { type: String },
  city: { type: String, default: 'Unknown' },
  country: { type: String, default: 'Unknown' },
  lat: { type: Number, default: 0 },
  lon: { type: Number, default: 0 },
  joinTime: { type: Date, default: Date.now },
  leaveTime: { type: Date, default: null },
  page: { type: String, default: '/' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Visitor', VisitorSchema);
