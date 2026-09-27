import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import app from './app.js';
import { StorageService } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  await StorageService.connect();
  if (process.env.SEED_ON_START === 'true') {
    const count = await StorageService.seedIfEmpty();
    if (count) console.log(`Seeded ${count} applications into MongoDB`);
  }
  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.resolve(dist, 'index.html')));
  }
  const server = app.listen(PORT, () => console.log(`TrackPath Server running at http://localhost:${PORT}`));
  const shutdown = async (signal: string) => { console.log(`${signal}: shutting down`); server.close(async () => { await StorageService.close(); process.exit(0); }); };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error(`Unable to start TrackPath: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
