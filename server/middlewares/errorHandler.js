export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Dữ liệu đã tồn tại (duplicate).' });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token không hợp lệ.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token đã hết hạn.' });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File quá lớn.' });
  }
  
  // Default
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi server.' 
      : err.message 
  });
};
