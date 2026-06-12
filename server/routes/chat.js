import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatLimiter } from '../middlewares/rateLimiter.js';

// Models
import Service from '../models/Service.js';
import FAQ from '../models/FAQ.js';
import About from '../models/About.js';
import Portfolio from '../models/Portfolio.js';
import Blog from '../models/Blog.js';
import Skill from '../models/Skill.js';
import DashboardStats from '../models/DashboardStats.js';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
const MAX_RETRIES = 2;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(genAI, systemInstruction, cleanHistory, currentMessage) {
  let lastError = null;
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
        const chat = model.startChat({
          history: cleanHistory,
          generationConfig: { maxOutputTokens: 1024 },
        });
        const result = await chat.sendMessage(currentMessage);
        const response = await result.response;
        const text = response.text();
        if (text) return text;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || err.toString();
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('SAFETY')) throw err;
        if ((errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('overloaded')) && attempt < MAX_RETRIES) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
        if (attempt < MAX_RETRIES) { await sleep(1000); continue; }
        break;
      }
    }
  }
  throw lastError || new Error('All models failed');
}

router.post('/', chatLimiter, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chatbot đang bảo trì. Vui lòng liên hệ trực tiếp.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Fetch all context data from DB
    const [services, faqs, aboutData, portfolios, skills, stats, config] = await Promise.all([
      Service.find(),
      FAQ.find(),
      About.findOne(),
      Portfolio.find().select('title category technologies description liveUrl'),
      Skill.find(),
      DashboardStats.findOne(),
      SiteConfig.findOne(),
    ]);

    // Build context
    let contextText = '';
    
    // Site info
    const siteName = config?.siteName || 'MVD Tech';
    contextText += `[THÔNG TIN TRANG WEB]\nTên: ${siteName}\nSlogan: ${config?.slogan || ''}\n\n`;
    
    // About
    if (aboutData) {
      contextText += `[THÔNG TIN CÁ NHÂN]\nTên: ${aboutData.name || 'MVD Tech'}\nHọc vấn: ${aboutData.education || ''}\nKỹ năng: ${aboutData.skills?.join(', ') || ''}\nMô tả: ${aboutData.description || ''}\n\n`;
    }
    
    // Skills
    if (skills.length > 0) {
      contextText += `[KỸ NĂNG]\n${skills.map(s => `- ${s.name} (${s.category}): ${s.level}%`).join('\n')}\n\n`;
    }
    
    // Portfolio
    if (portfolios.length > 0) {
      contextText += `[DỰ ÁN PORTFOLIO]\n${portfolios.map(p => `- ${p.title} (${p.category}): ${p.description?.substring(0, 100) || ''} | Tech: ${p.technologies?.join(', ') || ''} ${p.liveUrl ? '| URL: ' + p.liveUrl : ''}`).join('\n')}\n\n`;
    }
    
    // Services
    if (services.length > 0) {
      contextText += `[DỊCH VỤ & BẢNG GIÁ]\n${services.map(s => `- ${s.name} (${s.category}): ${s.price}. ${s.features?.join(', ') || ''}`).join('\n')}\n\n`;
    }
    
    // FAQ
    if (faqs.length > 0) {
      contextText += `[FAQ]\n${faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}\n\n`;
    }
    
    // Stats
    if (stats) {
      contextText += `[THỐNG KÊ]\nDự án: ${stats.projectsCompleted || 0} | Năm KN: ${stats.yearsExperience || 0} | Công nghệ: ${stats.technologiesUsed || 0} | Khách hàng: ${stats.clientsServed || 0}\n\n`;
    }

    const SYSTEM_PROMPT = `
Bạn là AI Assistant chính thức của ${siteName} — một digital hub cá nhân.
Bạn đóng vai trò như một "digital clone" của chủ website.

${contextText}

[QUY TẮC TRẢ LỜI]
1. Trả lời thân thiện, chuyên nghiệp, có emoji phù hợp.
2. Chỉ trả lời dựa trên dữ liệu thực từ website. Không bịa thông tin.
3. Nếu không có thông tin, hướng dẫn liên hệ trực tiếp.
4. Ngắn gọn, súc tích. Tối đa 200 từ mỗi câu trả lời.
5. Khi khách muốn xem dự án/dịch vụ cụ thể, trả về action JSON.

[ACTION FORMAT]
Khi cần điều hướng người dùng, thêm block JSON cuối tin nhắn:
\`\`\`action
{"type":"navigate","target":"/portfolio"}
\`\`\`
hoặc
\`\`\`action
{"type":"filter","section":"portfolio","value":"Web Development"}
\`\`\`

[XƯNG HÔ]
- Chưa rõ giới tính: xưng "mình", gọi "bạn"
- Nam: xưng "em", gọi "anh"  
- Nữ: xưng "em", gọi "chị"
`;

    const MAX_HISTORY = 10;
    const trimmedMessages = messages.length > MAX_HISTORY ? messages.slice(-MAX_HISTORY) : messages;
    
    let history = trimmedMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    while (history.length > 0 && history[0].role !== 'user') history.shift();
    
    const cleanHistory = [];
    let lastRole = null;
    for (const entry of history) {
      if (entry.role !== lastRole) { cleanHistory.push(entry); lastRole = entry.role; }
    }

    const currentMessage = trimmedMessages[trimmedMessages.length - 1].content;
    const text = await callGeminiWithRetry(genAI, SYSTEM_PROMPT, cleanHistory, currentMessage);
    
    // Parse actions from response
    let reply = text;
    let actions = [];
    const actionMatch = text.match(/```action\n([\s\S]*?)\n```/);
    if (actionMatch) {
      try {
        actions = [JSON.parse(actionMatch[1])];
        reply = text.replace(/```action\n[\s\S]*?\n```/, '').trim();
      } catch (e) { /* ignore parse errors */ }
    }

    res.json({ reply, actions });
  } catch (error) {
    console.error('[Chatbot] Error:', error.message);
    if (error.message?.includes('API_KEY_INVALID')) return res.status(500).json({ error: 'Chatbot đang bảo trì.' });
    if (error.message?.includes('SAFETY')) return res.status(400).json({ error: 'Tin nhắn không phù hợp.' });
    if (error.message?.includes('429') || error.message?.includes('quota')) return res.status(429).json({ error: 'Hệ thống đang bận, thử lại sau 30 giây.' });
    res.status(500).json({ error: 'Chatbot gặp sự cố, thử lại sau.' });
  }
});

export default router;
