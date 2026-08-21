import { findLimitViolations } from '../domain/readings.js';
import { AlertType, ReadingSource } from '../generated/prisma/enums.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { getSimulatedReading } from './scenarios.js';

const ALERT_COOLDOWN_MS = 10 * 60 * 1000;
let sequenceIndex = 0;

async function simulate() {
  const device = await prisma.device.findUnique({
    where: { hardwareCode: env.SIMULATOR_DEVICE_CODE },
    include: { elder: { include: { alertLimits: true } } },
  });
  if (!device) {
    throw new Error(`Dispositivo ${env.SIMULATOR_DEVICE_CODE} não encontrado. Execute npm run db:seed.`);
  }

  const sample = getSimulatedReading(sequenceIndex++);
  await prisma.$transaction(async (tx) => {
    await tx.reading.create({
      data: {
        deviceId: device.id,
        heartRate: sample.heartRate,
        temperature: sample.temperature,
        source: ReadingSource.SIMULATOR,
        signalQuality: sample.signalQuality,
        contactDetected: sample.contactDetected,
        valid: sample.valid,
        invalidReason: sample.invalidReason,
      },
    });
    await tx.device.update({ where: { id: device.id }, data: { lastSeenAt: new Date() } });

    if (!device.elder.alertLimits) return;
    const violations = findLimitViolations(sample, device.elder.alertLimits);
    for (const violation of violations) {
      const type = violation.type === 'HEART_RATE' ? AlertType.HEART_RATE : AlertType.TEMPERATURE;
      const recent = await tx.alert.findFirst({
        where: {
          elderId: device.elderId,
          type,
          timestamp: { gte: new Date(Date.now() - ALERT_COOLDOWN_MS) },
        },
      });
      if (!recent) {
        await tx.alert.create({
          data: {
            elderId: device.elderId,
            type,
            measuredValue: violation.value,
            message: violation.message,
          },
        });
      }
    }
  });

  console.log(`[${new Date().toISOString()}] ${sample.label}: bpm=${sample.heartRate ?? '-'} temp=${sample.temperature ?? '-'} válida=${sample.valid}`);
}

async function start() {
  console.log(`Simulador iniciado a cada ${env.SIMULATOR_INTERVAL_MS} ms.`);
  await simulate();
  const timer = setInterval(() => void simulate().catch(console.error), env.SIMULATOR_INTERVAL_MS);

  const shutdown = async () => {
    clearInterval(timer);
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

start().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
