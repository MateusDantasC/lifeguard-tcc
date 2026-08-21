import { compare, hash } from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { createAccessToken } from '../auth/token.js';
import { UserType } from '../generated/prisma/enums.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeUser } from '../serializers.js';

const registerSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  telefone: z.string().trim().min(8).max(20).optional(),
  senha: z.string().min(8).max(72),
  tipo: z.enum(['idoso', 'cuidador']),
});

const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  senha: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/cadastro', async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) throw new HttpError(409, 'Este e-mail já está cadastrado.', 'EMAIL_IN_USE');

  const type = input.tipo === 'idoso' ? UserType.ELDER : UserType.CAREGIVER;
  const user = await prisma.user.create({
    data: {
      name: input.nome,
      email: input.email,
      phone: input.telefone,
      passwordHash: await hash(input.senha, 12),
      type,
      ...(type === UserType.ELDER
        ? {
            elderProfile: { create: {} },
            alertLimits: { create: {} },
          }
        : {}),
    },
  });

  res.status(201).json({
    token: await createAccessToken(user.id, user.type),
    usuario: serializeUser(user),
  });
});

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await compare(input.senha, user.passwordHash))) {
    throw new HttpError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
  }

  res.json({
    token: await createAccessToken(user.id, user.type),
    usuario: serializeUser(user),
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) throw new HttpError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  res.json({ usuario: serializeUser(user) });
});
