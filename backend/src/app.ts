import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { authRouter } from './routes/auth.js';
import { linksRouter } from './routes/links.js';
import { monitoringRouter } from './routes/monitoring.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.APP_ORIGIN === '*' ? true : env.APP_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servico: 'lifeguard-api', horario: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/vinculos', linksRouter);
app.use('/api', monitoringRouter);
app.use(notFoundHandler);
app.use(errorHandler);
