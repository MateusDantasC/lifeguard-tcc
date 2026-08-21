import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(3333),
  APP_ORIGIN: z.string().default('*'),
  SIMULATOR_DEVICE_CODE: z.string().default('ESP32-DEMO-001'),
  SIMULATOR_INTERVAL_MS: z.coerce.number().int().min(1000).default(5000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Configuração inválida do backend: ${details}`);
}

export const env = result.data;
