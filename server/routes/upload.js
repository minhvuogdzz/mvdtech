import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
const uploadAudioMulter = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only mp3 files are allowed!'), false);
    }
  }
});

const streamUploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mvd-tech', ...options },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// Single image upload
router.post('/image', requireAuth, uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    let finalBuffer;
    if (req.file.mimetype === 'image/gif') {
      finalBuffer = req.file.buffer;
    } else {
      finalBuffer = await sharp(req.file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await streamUploadToCloudinary(finalBuffer);
      return res.json({ url: result.secure_url });
    } else {
      const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), finalBuffer);
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;
      return res.json({ url: `${serverUrl}/uploads/${filename}` });
    }
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Multiple images upload
router.post('/images', requireAuth, uploadLimiter, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const urls = [];
    for (const file of req.files) {
      let finalBuffer;
      if (file.mimetype === 'image/gif') {
        finalBuffer = file.buffer;
      } else {
        finalBuffer = await sharp(file.buffer)
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
      }
      const result = await streamUploadToCloudinary(finalBuffer);
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error('Upload Multiple Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Audio upload
router.post('/audio', requireAuth, uploadLimiter, uploadAudioMulter.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const result = await streamUploadToCloudinary(req.file.buffer, { resource_type: 'video' });
    const compressedUrl = result.secure_url.replace('/upload/', '/upload/br_96k/');
    res.json({ url: compressedUrl });
  } catch (err) {
    console.error('Upload Audio Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
