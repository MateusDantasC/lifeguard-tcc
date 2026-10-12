import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rate-limit.js';
import { deviceSampleSchema, DEVICE_STALE_MS, hashDeviceValue, matchesDeviceSecret, newDeviceSecret, normalizeDeviceSample, sustainedState } from '../domain/device-readings.js';

export const devicesRouter = Router();
const manageLimit = createRateLimit({ prefix: 'device-manage', max: 10, windowMs: 3600_000, key: (req) => req.auth!.userId });
const ingestLimit = createRateLimit({ prefix: 'device-ingest', max: 30, windowMs: 60_000 });
const patientOnly: import('express').RequestHandler = (req, _res, next) => {
  if (req.auth!.type !== 'ELDER') return next(new HttpError(403, 'Somente o paciente pode configurar seu dispositivo.', 'PATIENT_ONLY'));
  next();
};
const deviceSelect = { id: true, nickname: true, hardwareCode: true, lastSeenAt: true, pairedAt: true } as const;

devicesRouter.get('/me', requireAuth, patientOnly, async (req, res) => {
  const device = await prisma.device.findFirst({ where: { elderId: req.auth!.userId, active: true }, select: deviceSelect, orderBy: { pairedAt: 'desc' } });
  res.json({ dispositivo: device ? { ...device, conectado: !!device.lastSeenAt && Date.now() - device.lastSeenAt.getTime() <= DEVICE_STALE_MS } : null });
});

// Manual provisioning for the prototype: the patient transfers this one-time
// credential to their own firmware. A serial number alone grants no access.
devicesRouter.post('/provisionar', requireAuth, patientOnly, manageLimit, async (req, res) => {
  const { nome } = z.object({ nome: z.string().trim().min(2).max(60) }).strict().parse(req.body);
  const secret = newDeviceSecret();
  const device = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${req.auth!.userId}::uuid FOR UPDATE`;
    await tx.device.updateMany({ where: { elderId: req.auth!.userId, active: true }, data: { active: false, credentialHash: null } });
    return tx.device.create({ data: { elderId: req.auth!.userId, nickname: nome, hardwareCode: `LG-${randomUUID()}`, credentialHash: hashDeviceValue(secret) }, select: deviceSelect });
  });
  res.status(201).json({ dispositivo: device, credencial: `lgd_${device.id}.${secret}` });
});

devicesRouter.delete('/me', requireAuth, patientOnly, manageLimit, async (req, res) => {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${req.auth!.userId}::uuid FOR UPDATE`;
    await tx.device.updateMany({ where: { elderId: req.auth!.userId, active: true }, data: { active: false, credentialHash: null } });
  });
  res.status(204).send();
});

devicesRouter.post('/leituras', ingestLimit, async (req, res) => {
  const credential = /^Bearer lgd_([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(req.header('authorization') ?? '');
  const invalid = () => new HttpError(401, 'Credencial de dispositivo inválida.', 'INVALID_DEVICE_CREDENTIAL');
  if (!credential || !z.uuid().safeParse(credential[1]).success) throw invalid();
  const candidate = await prisma.device.findUnique({ where: { id: credential[1] } });
  if (!candidate?.active || !matchesDeviceSecret(credential[2]!, candidate.credentialHash)) throw invalid();
  const sample = deviceSampleSchema.parse(req.body);
  const payloadHash = hashDeviceValue(JSON.stringify(sample));
  const result = await prisma.$transaction(async (tx) => {
    // Same lock order as provisioning/revocation; serializes all patient devices.
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${candidate.elderId}::uuid FOR UPDATE`;
    const device = await tx.device.findUnique({ where: { id: candidate.id }, include: { elder: { include: { alertLimits: true } } } });
    if (!device?.active || !matchesDeviceSecret(credential[2]!, device.credentialHash)) throw invalid();
    const duplicate = await tx.reading.findUnique({ where: { deviceId_sampleId: { deviceId: device.id, sampleId: sample.sampleId } } });
    if (duplicate) {
      if (duplicate.payloadHash !== payloadHash) throw new HttpError(409, 'sampleId já utilizado com dados diferentes.', 'SAMPLE_CONFLICT');
      return { id: duplicate.id.toString(), duplicada: true, valida: duplicate.valid };
    }
    const timestamp = new Date(sample.timestamp);
    const now = new Date();
    if (timestamp.getTime() < now.getTime() - 120_000 || timestamp.getTime() > now.getTime() + 10_000) {
      throw new HttpError(400, 'Sincronize o relógio do dispositivo; a leitura deve ser recente.', 'INVALID_SAMPLE_TIME');
    }
    const latest = await tx.reading.findFirst({ where: { deviceId: device.id }, orderBy: { timestamp: 'desc' } });
    if (latest && timestamp <= latest.timestamp) throw new HttpError(409, 'Leitura fora de ordem.', 'OUT_OF_ORDER_SAMPLE');
    const reading = await tx.reading.create({ data: { deviceId: device.id, sampleId: sample.sampleId, payloadHash, timestamp, source: 'DEVICE', ...normalizeDeviceSample(sample) } });
    await tx.device.update({ where: { id: device.id }, data: { lastSeenAt: now } });
    const limits = device.elder.alertLimits;
    if (limits) {
      const recent = await tx.reading.findMany({ where: { deviceId: device.id }, orderBy: { timestamp: 'desc' }, take: 3 });
      for (const type of ['HEART_RATE', 'TEMPERATURE'] as const) {
        const state = sustainedState(recent, limits, type);
        if (!state) continue;
        if (state === 'normal') {
          await tx.alert.updateMany({ where: { elderId: device.elderId, type, resolvedAt: null }, data: { resolvedAt: now, status: 'RESOLVED' } });
          continue;
        }
        const existing = await tx.alert.findFirst({ where: { elderId: device.elderId, type, OR: [{ resolvedAt: null }, { timestamp: { gte: new Date(now.getTime() - 600_000) } }] } });
        if (existing) continue;
        const value = type === 'HEART_RATE' ? reading.heartRate! : reading.temperature!;
        await tx.alert.create({ data: {
          elderId: device.elderId, type, measuredValue: value,
          message: type === 'HEART_RATE' ? `Batimento fora do limite: ${value} bpm.` : `Temperatura fora do limite: ${value.toFixed(1)} °C.`,
          deviceDispatch: { create: {} },
        } });
      }
    }
    return { id: reading.id.toString(), duplicada: false, valida: reading.valid };
  });
  res.status(result.duplicada ? 200 : 201).json(result);
});
