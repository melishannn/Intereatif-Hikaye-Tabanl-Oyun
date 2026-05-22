import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Proxy API route
  // app.post('/api/gemini', async (req, res) => {
  //   try {
  //     const { prompt } = req.body;
  //     const apiKey = process.env.GEMINI_API_KEY;
  //     if (!apiKey) {
  //       throw new Error('GEMINI_API_KEY environment variable is not set');
  //     }
      
  //     const ai = new GoogleGenAI({ apiKey });
  //     const result = await ai.models.generateContent({
  //       model: 'gemini-2.0-flash',
  //       contents: prompt,
  //     });

  //     res.json(result);
  app.post('/api/generate-fan-letter', async (req, res) => {
    try {
      const { characterName, trait, level } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
      
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `You are a super fan writing a short fan letter to a K-pop idol named ${characterName} (trait: ${trait}, level: ${level}).
Write a passionate, slightly dramatic but sweet fan letter in Turkish (max 3 sentences). Also invent a small gift (like "Peluş Ayıcık", "Çiçek", "Gitar", "Kahve Kupa") and pick one suitable emoji for it.
Return JSON:
{
  "letter": "...",
  "giftName": "...",
  "giftEmoji": "🧸"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error('AI Fan Letter failed:', error.message);
      
      // Fallback response for rate limits or other API errors
      res.json({
        letter: "Seni sahnede izlemek muhteşemdi! Lütfen hep böyle parlamaya devam et, seni çok seviyoruz!",
        giftName: "Buket Çiçek",
        giftEmoji: "💐"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
