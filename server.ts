import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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
