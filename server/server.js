import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { v2 as cloudinary } from 'cloudinary';

// Routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import contentRoutes, { setEmitter } from './routes/content.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contact.js';

// Middleware
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Models for visitor tracking
import Visitor from './models/Visitor.js';

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Set emitter for content routes
setEmitter((section) => {
  io.emit('data-updated', { section, timestamp: Date.now() });
  console.log(`📡 Emitted data-updated for: ${section}`);
});

// Socket.IO connections
io.on('connection', async (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  const query = socket.handshake.query || {};
  if (query.type === 'admin') return;

  let dbVisitorId = null;
  const sessionId = query.sessionId;
  
  try {
    let existing = sessionId ? await Visitor.findOne({ sessionId }).sort({ joinTime: -1 }) : null;
    
    if (existing) {
      existing.leaveTime = null;
      await existing.save();
      dbVisitorId = existing._id;
    } else {
      let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
      if (ip.includes(',')) ip = ip.split(',')[0].trim();
      if (ip.startsWith('::ffff:')) ip = ip.substring(7);
      
      const newVisitor = new Visitor({
        sessionId,
        ip: ip === '::1' ? '127.0.0.1' : ip,
        city: 'Unknown',
        country: 'Unknown',
        joinTime: Date.now(),
      });
      const saved = await newVisitor.save();
      dbVisitorId = saved._id;
      
      // Async IP lookup
      if (ip !== '::1' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        fetch(`http://ip-api.com/json/${ip}`)
          .then(res => res.json())
          .then(async data => {
            if (data.status === 'success') {
              await Visitor.findByIdAndUpdate(dbVisitorId, {
                city: data.city, country: data.country,
                lat: data.lat, lon: data.lon
              });
            }
          })
          .catch(() => {});
      }
    }
    
    const visitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
    io.emit('visitor-updated', visitors);
  } catch (err) {
    console.error('Visitor tracking error:', err);
  }

  socket.on('disconnect', async () => {
    if (dbVisitorId) {
      try {
        await Visitor.findByIdAndUpdate(dbVisitorId, { leaveTime: Date.now() });
        const visitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
        io.emit('visitor-updated', visitors);
      } catch (err) {
        console.error('Visitor disconnect error:', err);
      }
    }
  });
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// Serve local uploads
app.use('/uploads', express.static('public/uploads'));

// Visitors API
app.get('/api/visitors', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ping (keep alive)
app.get('/api/ping', (req, res) => res.status(200).send('pong'));

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mvd-tech')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 MVD Tech Server running on port ${PORT}`);
      
      // Self-ping every 14 minutes (for Render free tier)
      const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      setInterval(async () => {
        try {
          await fetch(`${serverUrl}/api/ping`);
        } catch (e) {
          console.warn('[Self-Ping] Failed:', e.message);
        }
      }, 14 * 60 * 1000);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
