import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      const token = jwt.sign(
        { role: 'admin' }, 
        process.env.JWT_SECRET || 'mvd-tech-secret',
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token });
    }
    
    res.status(401).json({ error: 'Mật khẩu không chính xác' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
