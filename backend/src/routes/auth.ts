import { compare, hash } from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { createAccessToken } from '../auth/token.js';
import { Gender, UserType } from '../generated/prisma/enums.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeUser } from '../serializers.js';

const registerSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  telefone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/, 'Telefone internacional inválido.'),
  genero: z.enum(['feminino', 'masculino', 'nao_binario', 'outro', 'prefiro_nao_informar']),
  senha: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.')
    .regex(/[a-zà-öø-ÿ]/, 'A senha deve ter uma letra minúscula.')
    .regex(/[A-ZÀ-ÖØ-Þ]/, 'A senha deve ter uma letra maiúscula.')
    .regex(/\d/, 'A senha deve ter um número.')
    .regex(/[^\p{L}\p{N}\s]/u, 'A senha deve ter um caractere especial.'),
  tipo: z.enum(['idoso', 'cuidador']),
  aceitouTermos: z.literal(true, { error: 'É necessário aceitar os Termos de Uso.' }),
  aceitouPrivacidade: z.literal(true, { error: 'É necessário aceitar a Política de Privacidade.' }),
});

const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  senha: z.string().min(1),
});

const updateProfileSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  telefone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/, 'Telefone internacional inválido.').nullable().optional(),
  foto: z.string().max(750_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).nullable().optional(),
  genero: z.enum(['feminino', 'masculino', 'nao_binario', 'outro', 'prefiro_nao_informar']).nullable().optional(),
  perfilIdoso: z.object({
    dataNascimento: z.iso.date().nullable().optional(),
    tipoSanguineo: z.string().trim().max(5).nullable().optional(),
    alergias: z.string().trim().max(1000).nullable().optional(),
    medicamentos: z.string().trim().max(1000).nullable().optional(),
    condicoesMedicas: z.string().trim().max(1000).nullable().optional(),
    observacoesImportantes: z.string().trim().max(1000).nullable().optional(),
    contatoEmergenciaNome: z.string().trim().max(100).nullable().optional(),
    contatoEmergenciaTelefone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/, 'Telefone de emergência inválido.').nullable().optional(),
  }).refine(
    (profile) => Boolean(profile.contatoEmergenciaNome) === Boolean(profile.contatoEmergenciaTelefone),
    { message: 'Informe o nome e o telefone do contato de emergência.', path: ['contatoEmergenciaTelefone'] },
  ).optional(),
});

export const authRouter = Router();

const genderMap = {
  feminino: Gender.FEMALE,
  masculino: Gender.MALE,
  nao_binario: Gender.NON_BINARY,
  outro: Gender.OTHER,
  prefiro_nao_informar: Gender.PREFER_NOT_TO_SAY,
} as const;

authRouter.post('/cadastro', async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) throw new HttpError(409, 'Este e-mail já está cadastrado.', 'EMAIL_IN_USE');

  const type = input.tipo === 'idoso' ? UserType.ELDER : UserType.CAREGIVER;
  const acceptedAt = new Date();
  const user = await prisma.user.create({
    data: {
      name: input.nome,
      email: input.email,
      phone: input.telefone,
      gender: genderMap[input.genero],
      passwordHash: await hash(input.senha, 12),
      type,
      termsAcceptedAt: acceptedAt,
      privacyAcceptedAt: acceptedAt,
      legalDocumentVersion: '2026-09-01',
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
      ...(input.genero !== undefined ? { gender: input.genero ? genderMap[input.genero] : null } : {}),
      ...(input.foto !== undefined ? { profilePhoto: input.foto } : {}),
      ...(profileData ? { elderProfile: { upsert: { create: profileData, update: profileData } } } : {}),
    },
    include: { elderProfile: true },
  });
  res.json({ usuario: serializeUser(user, user.elderProfile) });
});
