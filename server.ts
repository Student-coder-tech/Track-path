import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StorageService, ValidationError } from './server/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.APP_URL?.trim() || true }));
app.use(express.json({ limit: '2mb' }));

const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next);
};
const error = (res: Response, status: number, message: string) => res.status(status).json({ error: message });
const id = (req: Request) => String(req.params.id);

app.get('/api/health', asyncRoute(async (_req, res) => {
  await StorageService.getAll();
  res.json({ ok: true, database: 'mongodb' });
}));

app.get('/api/applications', asyncRoute(async (req, res) => {
  const applications = await StorageService.getAll({
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    jobType: typeof req.query.jobType === 'string' ? req.query.jobType : undefined,
    workModel: typeof req.query.workModel === 'string' ? req.query.workModel : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
  });
  res.json(applications);
}));

app.get('/api/applications/:id', asyncRoute(async (req, res) => {
  const application = await StorageService.getById(id(req));
  if (!application) return void error(res, 404, 'Application not found');
  res.json(application);
}));

app.post('/api/applications', asyncRoute(async (req, res) => {
  const created = await StorageService.create(req.body);
  res.status(201).json(created);
}));

app.put('/api/applications/:id', asyncRoute(async (req, res) => {
  const updated = await StorageService.update(id(req), req.body);
  if (!updated) return void error(res, 404, 'Application not found');
  res.json(updated);
}));

app.patch('/api/applications/:id/status', asyncRoute(async (req, res) => {
  if (typeof req.body?.status !== 'string') return void error(res, 400, 'Status is required');
  const updated = await StorageService.updateStatus(id(req), req.body.status, req.body.comment);
  if (!updated) return void error(res, 404, 'Application not found');
  res.json(updated);
}));

app.post('/api/applications/:id/interviews', asyncRoute(async (req, res) => {
  const updated = await StorageService.addInterview(id(req), req.body);
  if (!updated) return void error(res, 404, 'Application not found');
  res.json(updated);
}));

app.post('/api/applications/:id/notes', asyncRoute(async (req, res) => {
  const updated = await StorageService.addNote(id(req), req.body?.content);
  if (!updated) return void error(res, 404, 'Application not found');
  res.json(updated);
}));

app.patch('/api/applications/:id/deadline-toggle', asyncRoute(async (req, res) => {
  const updated = await StorageService.toggleDeadline(id(req));
  if (!updated) return void error(res, 404, 'Application not found');
  res.json(updated);
}));

app.delete('/api/applications/:id', asyncRoute(async (req, res) => {
  if (!await StorageService.delete(id(req))) return void error(res, 404, 'Application not found');
  res.json({ success: true, message: 'Application deleted successfully' });
}));

app.get('/api/analytics', asyncRoute(async (_req, res) => { res.json(await StorageService.getAnalytics()); }));
app.get('/api/reminders', asyncRoute(async (_req, res) => { res.json(await StorageService.getReminders()); }));

app.get('/api/export', asyncRoute(async (req, res) => {
  const applications = await StorageService.getAll();
  if (req.query.format === 'csv') {
    const headers = ['Company', 'Role', 'Status', 'Job Type', 'Work Model', 'Location', 'Salary', 'Applied Date', 'Deadline', 'Rating', 'Tags'];
    const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = applications.map((app) => [app.company, app.role, app.status, app.jobType, app.workModel, app.location, app.salaryRange, app.appliedDate, app.deadline, app.rating, (app.tags || []).join(', ')].map(quote).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="applications-export.csv"');
    return void res.send([headers.map(quote).join(','), ...rows].join('\n'));
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="applications-backup.json"');
  res.json(applications);
}));

app.post('/api/import', asyncRoute(async (req, res) => {
  if (!Array.isArray(req.body?.applications)) return void error(res, 400, 'Expected an array of applications');
  const applications = await StorageService.replaceAll(req.body.applications);
  res.json({ success: true, count: applications.length });
}));

app.post('/api/reset-sample', asyncRoute(async (_req, res) => {
  const applications = await StorageService.resetToSeed();
  res.json({ success: true, count: applications.length, applications });
}));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  if (err instanceof ValidationError) return void error(res, err.statusCode, err.message);
  console.error(isProduction ? 'Request failed' : err);
  error(res, 500, isProduction ? 'Internal server error' : (err instanceof Error ? err.message : 'Internal server error'));
});

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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
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
