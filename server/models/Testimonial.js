import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  quote: { type: String, required: true },
  quoteEn: { type: String, default: '' },
  image: { type: String },
  company: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Testimonial', TestimonialSchema);
