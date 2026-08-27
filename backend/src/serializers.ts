import type { ElderProfile, User } from './generated/prisma/client.js';
import { UserType } from './generated/prisma/enums.js';

export function serializeElderProfile(profile?: ElderProfile | null) {
  if (!profile) return null;
  return {
    dataNascimento: profile.birthDate?.toISOString().slice(0, 10) ?? null,
    tipoSanguineo: profile.bloodType,
    alergias: profile.allergies,
    medicamentos: profile.medications,
    condicoesMedicas: profile.medicalConditions,
    observacoesImportantes: profile.importantNotes,
    contatoEmergenciaNome: profile.emergencyContactName,
    contatoEmergenciaTelefone: profile.emergencyContactPhone,
  };
}

export function serializeUser(
  user: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'type' | 'profilePhoto'>,
  elderProfile?: ElderProfile | null,
) {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    telefone: user.phone,
    foto: user.profilePhoto,
    tipo: user.type === UserType.ELDER ? 'idoso' : 'cuidador',
    perfilIdoso: user.type === UserType.ELDER ? serializeElderProfile(elderProfile) : null,
  };
}
