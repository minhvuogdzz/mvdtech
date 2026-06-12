import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionEn: { type: String, default: '' },
  answer: { type: String, required: true },
  answerEn: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('FAQ', FAQSchema);
