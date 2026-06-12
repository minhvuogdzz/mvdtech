import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';

// Models
import SiteConfig from '../models/SiteConfig.js';
import Hero from '../models/Hero.js';
import Portfolio from '../models/Portfolio.js';
import Service from '../models/Service.js';
import About from '../models/About.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import LiveActivity from '../models/LiveActivity.js';
import DashboardStats from '../models/DashboardStats.js';

const router = express.Router();

// Helper to emit realtime updates
let emitDataUpdate = () => {};
export const setEmitter = (fn) => { emitDataUpdate = fn; };

// ==================== GENERIC CRUD FACTORY ====================
// For singleton documents (one record per collection)
const singletonRoutes = (path, Model, sectionName) => {
  router.get(`/${path}`, async (req, res) => {
    try {
      const doc = await Model.findOne();
      res.json(doc || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post(`/${path}`, requireAuth, async (req, res) => {
    try {
      let doc = await Model.findOne();
      if (doc) {
        Object.assign(doc, req.body);
      } else {
        doc = new Model(req.body);
      }
      await doc.save();
      emitDataUpdate(sectionName);
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// For collection documents (many records)
const collectionRoutes = (path, Model, sectionName, sortOptions = { order: 1, createdAt: -1 }) => {
  router.get(`/${path}`, async (req, res) => {
    try {
      const { page, limit, search, tag, category, status } = req.query;
      
      let query = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { question: { $regex: search, $options: 'i' } },
        ];
      }
      if (tag) query.tags = tag;
      if (category) query.category = category;
      if (status) query.status = status;
      
      if (page && limit) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [docs, total] = await Promise.all([
          Model.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)),
          Model.countDocuments(query)
        ]);
        return res.json({ data: docs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
      }
      
      const docs = await Model.find(query).sort(sortOptions);
      res.json(docs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get(`/${path}/:idOrSlug`, async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let doc;
      if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await Model.findById(idOrSlug);
      } else {
        doc = await Model.findOne({ slug: idOrSlug });
      }
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post(`/${path}`, requireAuth, async (req, res) => {
    try {
      let doc;
      if (req.body._id) {
        doc = await Model.findByIdAndUpdate(req.body._id, req.body, { new: true, runValidators: true });
      } else {
        const count = await Model.countDocuments();
        req.body.order = req.body.order ?? count;
        doc = new Model(req.body);
        await doc.save();
      }
      emitDataUpdate(sectionName);
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put(`/${path}/reorder`, requireAuth, async (req, res) => {
    try {
      const { items } = req.body;
      for (const item of items) {
        await Model.findByIdAndUpdate(item.id, { order: item.order });
      }
      emitDataUpdate(sectionName);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete(`/${path}/:id`, requireAuth, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      emitDataUpdate(sectionName);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// ==================== REGISTER ROUTES ====================

// Singletons
singletonRoutes('config', SiteConfig, 'config');
singletonRoutes('hero', Hero, 'hero');
singletonRoutes('about', About, 'about');
singletonRoutes('dashboard-stats', DashboardStats, 'dashboard-stats');

// Collections
collectionRoutes('portfolio', Portfolio, 'portfolio');
collectionRoutes('services', Service, 'services');
collectionRoutes('testimonials', Testimonial, 'testimonials');
collectionRoutes('faq', FAQ, 'faq');
collectionRoutes('skills', Skill, 'skills');
collectionRoutes('timeline', Timeline, 'timeline');
collectionRoutes('live-activity', LiveActivity, 'live-activity');

// ==================== BLOG SPECIAL ROUTES ====================
import Blog from '../models/Blog.js';

router.get('/blog', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag, status } = req.query;
    
    let query = {};
    // Public endpoint: only show published posts unless admin
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      query.status = 'published';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) query.tags = tag;
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Blog.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Blog.countDocuments(query)
    ]);
    
    res.json({ 
      data: posts, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / parseInt(limit)) 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/blog', requireAuth, async (req, res) => {
  try {
    let post;
    if (req.body._id) {
      post = await Blog.findByIdAndUpdate(req.body._id, req.body, { new: true, runValidators: true });
    } else {
      post = new Blog(req.body);
      await post.save();
    }
    emitDataUpdate('blog');
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blog/:id', requireAuth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    emitDataUpdate('blog');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unique blog tags
router.get('/blog-tags', async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', { status: 'published' });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
