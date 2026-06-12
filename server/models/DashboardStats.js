import mongoose from 'mongoose';

const DashboardStatsSchema = new mongoose.Schema({
  projectsCompleted: { type: Number, default: 0 },
  yearsExperience: { type: Number, default: 0 },
  technologiesUsed: { type: Number, default: 0 },
  linesOfCode: { type: String, default: '0' },
  clientsServed: { type: Number, default: 0 },
  
  // Custom stats
  customStats: [{
    label: { type: String },
    labelEn: { type: String },
    value: { type: String },
    icon: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('DashboardStats', DashboardStatsSchema);
