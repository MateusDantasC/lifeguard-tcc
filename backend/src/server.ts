import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`LifeGuard API disponível na porta ${env.PORT}.`);
});

async function shutdown(signal: string) {
  console.log(`${signal} recebido; encerrando a API.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
