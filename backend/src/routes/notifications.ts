import { Router } from 'express';
import { z } from 'zod';
import { LinkStatus, UserType } from '../generated/prisma/enums.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPushToUsers } from '../services/push.js';

const tokenSchema = z.string().trim().max(300).regex(/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/, 'Token push inválido.');

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.post('/token', async (req, res) => {
  const input = z.object({
    token: tokenSchema,
    plataforma: z.enum(['android', 'ios']),
  }).parse(req.body);

  await prisma.pushToken.upsert({
    where: { token: input.token },
    create: { userId: req.auth!.userId, token: input.token, platform: input.plataforma },
    update: { userId: req.auth!.userId, platform: input.plataforma, active: true },
  });
  res.status(204).send();
});

notificationsRouter.delete('/token', async (req, res) => {
  const input = z.object({ token: tokenSchema }).parse(req.body);
  await prisma.pushToken.updateMany({
    where: { token: input.token, userId: req.auth!.userId },
    data: { active: false },
  });
  res.status(204).send();
});

notificationsRouter.post('/teste', async (req, res) => {
  if (req.auth!.type === UserType.ELDER) {
    const patient = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: {
        name: true,
        elderLinks: {
          where: { status: LinkStatus.ACTIVE },
          select: { caregiverId: true },
        },
      },
    });
    if (!patient) throw new HttpError(404, 'Paciente não encontrado.', 'USER_NOT_FOUND');
    if (patient.elderLinks.length === 0) {
      throw new HttpError(409, 'Vincule pelo menos um cuidador antes de enviar um teste.', 'NO_ACTIVE_CAREGIVERS');
    }

    const caregiverIds = patient.elderLinks.map(({ caregiverId }) => caregiverId);
    const sent = await sendPushToUsers(caregiverIds, {
      title: `Teste de alerta de ${patient.name}`,
      body: `${patient.name} enviou um teste pelo LifeGuard. O vínculo de cuidado está funcionando.`,
      data: { tipo: 'teste_alerta', pacienteId: req.auth!.userId },
    });
    if (sent === 0) {
      throw new HttpError(
        409,
        'Nenhum cuidador vinculado ativou as notificações no próprio celular.',
        'CAREGIVERS_PUSH_NOT_REGISTERED',
      );
    }
    res.json({ enviadas: sent, destino: 'cuidadores' });
    return;
  }

  const sent = await sendPushToUsers([req.auth!.userId], {
    title: 'LifeGuard está conectado',
    body: 'As notificações deste aparelho estão funcionando corretamente.',
    data: { tipo: 'teste' },
  });
  if (sent === 0) throw new HttpError(409, 'Ative as notificações neste aparelho antes de fazer o teste.', 'PUSH_NOT_REGISTERED');
  res.json({ enviadas: sent, destino: 'este_aparelho' });
});
