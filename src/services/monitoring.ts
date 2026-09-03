import { apiRequest, formatDateTime, formatRelativeTime } from './api';
import type { AlertLimits, Caregiver, Elder, MonitoringAlert } from '../store/monitoringStore';
import type { ElderProfile, Gender } from '../store/authStore';

type ApiReading = {
  id: string;
  batimento: number | null;
  temperatura: number | null;
  horario: string;
  qualidadeSinal: string;
  contatoDetectado: boolean;
  valida: boolean;
  motivoInvalido: string | null;
};

type ApiElder = {
  id: string;
  vinculoId?: string;
  nome: string;
  telefone: string | null;
  foto?: string | null;
  genero?: Gender | null;
  perfilIdoso?: ElderProfile | null;
  status: Elder['status'];
  ultimaLeitura: ApiReading | null;
  limites?: ApiLimits | null;
};

type ApiLimits = {
  batimentoMin: number;
  batimentoMax: number;
  temperaturaMin: number;
  temperaturaMax: number;
  atualizadoEm: string;
  definidoPor: string | null;
};

export type Reading = ApiReading;

export function mapElder(elder: ApiElder): Elder {
  return {
    id: elder.id,
    vinculoId: elder.vinculoId,
    nome: elder.nome,
    telefone: elder.telefone ?? '',
    foto: elder.foto,
    genero: elder.genero,
    perfilIdoso: elder.perfilIdoso,
    status: elder.status,
    batimento: elder.ultimaLeitura?.valida ? elder.ultimaLeitura.batimento : null,
    temperatura: elder.ultimaLeitura?.valida ? elder.ultimaLeitura.temperatura : null,
    ultimaAtualizacao: formatRelativeTime(elder.ultimaLeitura?.horario),
  };
}

export function mapLimits(limits: ApiLimits): AlertLimits {
  return {
    batimentoMin: limits.batimentoMin,
    batimentoMax: limits.batimentoMax,
    temperaturaMin: limits.temperaturaMin,
    temperaturaMax: limits.temperaturaMax,
    updatedBy: limits.definidoPor ?? 'sistema',
    updatedAt: formatDateTime(limits.atualizadoEm),
  };
}

export async function fetchCaregiverDashboard() {
  const [eldersResponse, alertsResponse] = await Promise.all([
    apiRequest<{ idosos: ApiElder[] }>('/idosos'),
    apiRequest<{ alertas: Array<Omit<MonitoringAlert, 'horario'> & { horario: string; valor: number | null }> }>('/alertas'),
  ]);
  return {
    elders: eldersResponse.idosos.map(mapElder),
    alerts: alertsResponse.alertas
      .filter((alert): alert is typeof alert & { valor: number; tipo: 'batimento' | 'temperatura' } =>
        alert.valor !== null && (alert.tipo === 'batimento' || alert.tipo === 'temperatura'))
      .map((alert) => ({ ...alert, horario: formatDateTime(alert.horario) })),
  };
}

export async function fetchElder(elderId: string) {
  const response = await apiRequest<{ idoso: ApiElder }>(`/idosos/${elderId}`);
  return {
    elder: mapElder(response.idoso),
    limits: response.idoso.limites ? mapLimits(response.idoso.limites) : null,
  };
}

export async function fetchLimits(elderId: string) {
  const response = await apiRequest<{ limites: ApiLimits }>(`/idosos/${elderId}/limites`);
  return mapLimits(response.limites);
}

export async function saveLimits(elderId: string, limits: Omit<AlertLimits, 'updatedBy' | 'updatedAt'>) {
  const response = await apiRequest<{ limites: ApiLimits }>(`/idosos/${elderId}/limites`, {
    method: 'PUT',
    body: JSON.stringify(limits),
  });
  return mapLimits(response.limites);
}

export async function fetchReadings(elderId: string, limit = 100) {
  const response = await apiRequest<{ leituras: Reading[] }>(`/idosos/${elderId}/leituras?limite=${limit}`);
  return response.leituras;
}

export async function fetchCaregivers(): Promise<Caregiver[]> {
  const response = await apiRequest<{ vinculos: Array<{ id: string; usuario: { id: string; nome: string; telefone?: string | null; foto?: string | null }; vinculadoEm: string }> }>('/vinculos');
  return response.vinculos.map((link) => ({
    id: link.id,
    usuarioId: link.usuario.id,
    nome: link.usuario.nome,
    telefone: link.usuario.telefone ?? '',
    foto: link.usuario.foto,
    vinculadoDesde: `desde ${new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(link.vinculadoEm))}`,
  }));
}
