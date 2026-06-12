import express from 'express';
import { contactLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, service } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên, email và tin nhắn.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ.' });
    }

    // TODO: Send email notification via nodemailer
    console.log(`[Contact] New message from ${name} (${email}): ${message}`);
    
    res.json({ success: true, message: 'Cảm ơn bạn! Tin nhắn đã được gửi thành công.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
