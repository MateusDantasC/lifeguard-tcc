import { Router } from 'express';
import { z } from 'zod';
import { classifyReading } from '../domain/readings.js';
import { AlertStatus, LinkStatus, UserType } from '../generated/prisma/enums.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const idSchema = z.uuid();
const limitsSchema = z.object({
  batimentoMin: z.number().int().min(30).max(150),
  batimentoMax: z.number().int().min(50).max(240),
  temperaturaMin: z.number().min(30).max(40),
  temperaturaMax: z.number().min(34).max(45),
}).refine((data) => data.batimentoMin < data.batimentoMax, {
  message: 'O limite mínimo de batimento deve ser menor que o máximo.',
  path: ['batimentoMax'],
}).refine((data) => data.temperaturaMin < data.temperaturaMax, {
  message: 'O limite mínimo de temperatura deve ser menor que o máximo.',
  path: ['temperaturaMax'],
});

export const monitoringRouter = Router();
monitoringRouter.use(requireAuth);

async function assertElderAccess(userId: string, userType: UserType, elderId: string) {
  if (userType === UserType.ELDER && userId === elderId) return;
  if (userType === UserType.CAREGIVER) {
    const link = await prisma.caregiverElderLink.findFirst({
      where: { caregiverId: userId, elderId, status: LinkStatus.ACTIVE },
      select: { id: true },
    });
    if (link) return;
  }
  throw new HttpError(403, 'Você não possui acesso a este idoso.', 'ELDER_ACCESS_DENIED');
}

function serializeLimits(limits: {
  heartRateMinimum: number;
  heartRateMaximum: number;
  temperatureMinimum: number;
  temperatureMaximum: number;
  updatedAt: Date;
  definedBy?: { name: string } | null;
}) {
  return {
    batimentoMin: limits.heartRateMinimum,
    batimentoMax: limits.heartRateMaximum,
    temperaturaMin: limits.temperatureMinimum,
    temperaturaMax: limits.temperatureMaximum,
    atualizadoEm: limits.updatedAt,
    definidoPor: limits.definedBy?.name ?? null,
  };
}

function serializeReading(reading: {
  id: bigint;
  heartRate: number | null;
  temperature: number | null;
  timestamp: Date;
  signalQuality: string;
  contactDetected: boolean;
  valid: boolean;
  invalidReason: string | null;
} | null) {
  if (!reading) return null;
  return {
    id: reading.id.toString(),
    batimento: reading.heartRate,
    temperatura: reading.temperature,
    horario: reading.timestamp,
    qualidadeSinal: reading.signalQuality.toLowerCase(),
    contatoDetectado: reading.contactDetected,
    valida: reading.valid,
    motivoInvalido: reading.invalidReason,
  };
}

monitoringRouter.get('/idosos', async (req, res) => {
  if (req.auth!.type !== UserType.CAREGIVER) {
    throw new HttpError(403, 'Apenas cuidadores possuem uma lista de idosos.', 'CAREGIVER_ONLY');
  }

  const links = await prisma.caregiverElderLink.findMany({
    where: { caregiverId: req.auth!.userId, status: LinkStatus.ACTIVE },
    include: {
      elder: {
        include: {
          alertLimits: true,
          devices: {
            where: { active: true },
            take: 1,
            include: { readings: { orderBy: { timestamp: 'desc' }, take: 1 } },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const idosos = links.map(({ elder }) => {
    const latest = elder.devices[0]?.readings[0] ?? null;
    const limits = elder.alertLimits ?? {
      heartRateMinimum: 50,
      heartRateMaximum: 120,
      temperatureMinimum: 35.5,
      temperatureMaximum: 37.8,
    };
    return {
      id: elder.id,
      nome: elder.name,
      telefone: elder.phone,
      status: classifyReading(latest, limits),
      ultimaLeitura: serializeReading(latest),
    };
  });

  res.json({ idosos });
});

monitoringRouter.get('/idosos/:idosoId', async (req, res) => {
  const elderId = idSchema.parse(req.params.idosoId);
  await assertElderAccess(req.auth!.userId, req.auth!.type, elderId);
  const elder = await prisma.user.findFirst({
    where: { id: elderId, type: UserType.ELDER },
    include: {
      elderProfile: true,
      alertLimits: { include: { definedBy: { select: { name: true } } } },
      devices: {
        where: { active: true },
        take: 1,
        include: { readings: { orderBy: { timestamp: 'desc' }, take: 1 } },
      },
    },
  });
  if (!elder) throw new HttpError(404, 'Idoso não encontrado.', 'ELDER_NOT_FOUND');

  const latest = elder.devices[0]?.readings[0] ?? null;
  const limits = elder.alertLimits;
  res.json({
    idoso: {
      id: elder.id,
      nome: elder.name,
      telefone: elder.phone,
      contatoEmergencia: elder.elderProfile
        ? {
            nome: elder.elderProfile.emergencyContactName,
            telefone: elder.elderProfile.emergencyContactPhone,
          }
        : null,
      status: limits ? classifyReading(latest, limits) : 'sem_sinal',
      ultimaLeitura: serializeReading(latest),
      limites: limits ? serializeLimits(limits) : null,
    },
  });
});

monitoringRouter.get('/idosos/:idosoId/leituras', async (req, res) => {
  const elderId = idSchema.parse(req.params.idosoId);
  const query = z.object({ limite: z.coerce.number().int().min(1).max(500).default(100) }).parse(req.query);
  await assertElderAccess(req.auth!.userId, req.auth!.type, elderId);

  const readings = await prisma.reading.findMany({
    where: { device: { elderId, active: true } },
    orderBy: { timestamp: 'desc' },
    take: query.limite,
  });
  res.json({ leituras: readings.map(serializeReading) });
});

monitoringRouter.get('/idosos/:idosoId/limites', async (req, res) => {
  const elderId = idSchema.parse(req.params.idosoId);
  await assertElderAccess(req.auth!.userId, req.auth!.type, elderId);
  const limits = await prisma.alertLimit.findUnique({
    where: { elderId },
    include: { definedBy: { select: { name: true } } },
  });
  if (!limits) throw new HttpError(404, 'Limites não encontrados.', 'LIMITS_NOT_FOUND');
  res.json({ limites: serializeLimits(limits) });
});

monitoringRouter.put('/idosos/:idosoId/limites', async (req, res) => {
  if (req.auth!.type !== UserType.CAREGIVER) {
    throw new HttpError(403, 'Somente cuidadores podem alterar limites.', 'CAREGIVER_ONLY');
  }
  const elderId = idSchema.parse(req.params.idosoId);
  const input = limitsSchema.parse(req.body);
  await assertElderAccess(req.auth!.userId, req.auth!.type, elderId);
  const limits = await prisma.alertLimit.upsert({
    where: { elderId },
    create: {
      elderId,
      heartRateMinimum: input.batimentoMin,
      heartRateMaximum: input.batimentoMax,
      temperatureMinimum: input.temperaturaMin,
      temperatureMaximum: input.temperaturaMax,
      definedById: req.auth!.userId,
    },
    update: {
      heartRateMinimum: input.batimentoMin,
      heartRateMaximum: input.batimentoMax,
      temperatureMinimum: input.temperaturaMin,
      temperatureMaximum: input.temperaturaMax,
      definedById: req.auth!.userId,
    },
    include: { definedBy: { select: { name: true } } },
  });
  res.json({ limites: serializeLimits(limits) });
});

monitoringRouter.get('/alertas', async (req, res) => {
  const elderFilter = req.auth!.type === UserType.ELDER
    ? { elderId: req.auth!.userId }
    : { elder: { elderLinks: { some: { caregiverId: req.auth!.userId, status: LinkStatus.ACTIVE } } } };
  const alerts = await prisma.alert.findMany({
    where: elderFilter,
    include: { elder: { select: { name: true } } },
    orderBy: { timestamp: 'desc' },
    take: 200,
  });
  res.json({
    alertas: alerts.map((alert) => ({
      id: alert.id,
      idosoId: alert.elderId,
      idosoNome: alert.elder.name,
      tipo: {
        HEART_RATE: 'batimento',
        TEMPERATURE: 'temperatura',
        DEVICE_OFFLINE: 'dispositivo_offline',
        SIGNAL_LOST: 'sinal_perdido',
      }[alert.type],
      valor: alert.measuredValue,
      mensagem: alert.message,
      horario: alert.timestamp,
      status: alert.status.toLowerCase(),
    })),
  });
});

monitoringRouter.patch('/alertas/:alertaId', async (req, res) => {
  const alertId = idSchema.parse(req.params.alertaId);
  const input = z.object({ status: z.enum(['novo', 'visto', 'resolvido']) }).parse(req.body);
  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert) throw new HttpError(404, 'Alerta não encontrado.', 'ALERT_NOT_FOUND');
  await assertElderAccess(req.auth!.userId, req.auth!.type, alert.elderId);
  const statusMap = { novo: AlertStatus.NEW, visto: AlertStatus.SEEN, resolvido: AlertStatus.RESOLVED } as const;
  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: {
      status: statusMap[input.status],
      resolvedAt: input.status === 'resolvido' ? new Date() : null,
    },
  });
  res.json({ alerta: { id: updated.id, status: updated.status.toLowerCase() } });
});
