import express from 'express';
import path from 'path';
import fs from 'fs';
import apiRoutes from './src/server/routes.ts';
import nowpaymentsRoutes from './src/server/nowpayments.ts';

// Catch unexpected exceptions to prevent container crash
process.on('uncaughtException', (err) => {
  console.error('Process uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Process unhandledRejection:', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json());

  // Direct Health Check endpoints for Cloud Run & Control Plane
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Blind Box Game Win BIG Suite',
      db: 'Cloud Database',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routes
  app.use('/api/nowpayments', nowpaymentsRoutes);
  app.use('/api', apiRoutes);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV === 'development') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Failed to initialize Vite development middleware:', viteErr);
    }
  } else {
    // Production: serve built static files from dist directory
    const candidates = [
      path.resolve(__dirname),
      path.resolve(__dirname, 'dist'),
      path.resolve(process.cwd(), 'dist'),
      path.resolve(process.cwd()),
      '/app/applet/dist',
    ];

    const distPath =
      candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ||
      path.resolve(process.cwd(), 'dist');

    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!DOCTYPE html><html><head><title>Blind Box Game</title></head><body>Blind Box Game is running.</body></html>');
      }
    });
  }

  // Fallback global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT} (mode: ${process.env.NODE_ENV || 'production'})`);
  });
}

startServer();
