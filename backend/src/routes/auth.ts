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
  telefone: z.string().trim().min(10).max(20),
  senha: z.string().min(8).max(72),
  tipo: z.enum(['idoso', 'cuidador']),
});

const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  senha: z.string().min(1),
});

const updateProfileSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  telefone: z.string().trim().min(8).max(20).nullable().optional(),
  foto: z.string().max(750_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).nullable().optional(),
  perfilIdoso: z.object({
    dataNascimento: z.iso.date().nullable().optional(),
    tipoSanguineo: z.string().trim().max(5).nullable().optional(),
    alergias: z.string().trim().max(1000).nullable().optional(),
    medicamentos: z.string().trim().max(1000).nullable().optional(),
    condicoesMedicas: z.string().trim().max(1000).nullable().optional(),
    observacoesImportantes: z.string().trim().max(1000).nullable().optional(),
    contatoEmergenciaNome: z.string().trim().max(100).nullable().optional(),
    contatoEmergenciaTelefone: z.string().trim().max(20).nullable().optional(),
  }).optional(),
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
    include: { elderProfile: true },
  });

  res.status(201).json({
    token: await createAccessToken(user.id, user.type),
    usuario: serializeUser(user, user.elderProfile),
  });
});

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email }, include: { elderProfile: true } });

  if (!user || !(await compare(input.senha, user.passwordHash))) {
    throw new HttpError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
  }

  res.json({
    token: await createAccessToken(user.id, user.type),
    usuario: serializeUser(user, user.elderProfile),
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, include: { elderProfile: true } });
  if (!user) throw new HttpError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  res.json({ usuario: serializeUser(user, user.elderProfile) });
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const input = updateProfileSchema.parse(req.body);
  const emailOwner = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (emailOwner && emailOwner.id !== req.auth!.userId) {
    throw new HttpError(409, 'Este e-mail já está cadastrado.', 'EMAIL_IN_USE');
  }
  const currentUser = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { type: true } });
  if (!currentUser) throw new HttpError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  if (input.perfilIdoso && currentUser.type !== UserType.ELDER) {
    throw new HttpError(403, 'Somente o idoso pode preencher informações do paciente.', 'ELDER_ONLY');
  }

  const profile = input.perfilIdoso;
  const profileData = profile ? {
    birthDate: profile.dataNascimento ? new Date(`${profile.dataNascimento}T12:00:00.000Z`) : null,
    bloodType: profile.tipoSanguineo || null,
    allergies: profile.alergias || null,
    medications: profile.medicamentos || null,
    medicalConditions: profile.condicoesMedicas || null,
    importantNotes: profile.observacoesImportantes || null,
    emergencyContactName: profile.contatoEmergenciaNome || null,
    emergencyContactPhone: profile.contatoEmergenciaTelefone || null,
  } : undefined;

  const user = await prisma.user.update({
    where: { id: req.auth!.userId },
    data: {
      name: input.nome,
      email: input.email,
      phone: input.telefone || null,
      ...(input.foto !== undefined ? { profilePhoto: input.foto } : {}),
      ...(profileData ? { elderProfile: { upsert: { create: profileData, update: profileData } } } : {}),
    },
    include: { elderProfile: true },
  });
  res.json({ usuario: serializeUser(user, user.elderProfile) });
});
