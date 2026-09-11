import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { authRouter } from './routes/auth.js';
import { linksRouter } from './routes/links.js';
import { monitoringRouter } from './routes/monitoring.js';
import { notificationsRouter } from './routes/notifications.js';
import { prisma } from './lib/prisma.js';
import { requestLogging } from './middleware/request-logging.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.APP_ORIGIN === '*' ? true : env.APP_ORIGIN }));
app.use(requestLogging);
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', servico: 'lifeguard-api', banco: 'ok', horario: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'indisponivel', servico: 'lifeguard-api', banco: 'indisponivel', horario: new Date().toISOString() });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/vinculos', linksRouter);
app.use('/api/notificacoes', notificationsRouter);
app.use('/api', monitoringRouter);
app.use(notFoundHandler);
app.use(errorHandler);
