import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionEn: { type: String, default: '' },

  date: { type: Date, required: true },

  type: {
    type: String,
    default: 'milestone',
    enum: ['education', 'project', 'milestone', 'achievement', 'work']
  },

  icon: { type: String, default: '' },
  link: { type: String, default: '' },

  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Timeline', TimelineSchema);
