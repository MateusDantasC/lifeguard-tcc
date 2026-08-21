import { create } from 'zustand';
import type { StatusKey } from '../theme/theme';

export type Elder = {
  id: string;
  nome: string;
  status: StatusKey;
  batimento: number;
  temperatura: number;
  telefone: string;
  ultimaAtualizacao: string;
};

export type AlertStatus = 'novo' | 'visto' | 'resolvido';
export type MonitoringAlert = {
  id: string;
  idosoId: string;
  idosoNome: string;
  tipo: 'batimento' | 'temperatura';
  valor: number;
  horario: string;
  status: AlertStatus;
};

export type AlertLimits = {
  batimentoMin: number;
  batimentoMax: number;
  temperaturaMin: number;
  temperaturaMax: number;
  updatedBy: string;
  updatedAt: string;
};

type Caregiver = { id: string; nome: string; vinculadoDesde: string };

type MonitoringState = {
  elders: Elder[];
  caregivers: Caregiver[];
  alerts: MonitoringAlert[];
  limitsByElder: Record<string, AlertLimits>;
  addElderByCode: (code: string) => boolean;
  removeCaregiver: (id: string) => void;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  updateLimits: (elderId: string, limits: Omit<AlertLimits, 'updatedBy' | 'updatedAt'>) => void;
};

const defaultLimits: AlertLimits = {
  batimentoMin: 60,
  batimentoMax: 120,
  temperaturaMin: 35.5,
  temperaturaMax: 37.8,
  updatedBy: 'Ana Pereira',
  updatedAt: '18 ago 2026',
};

// TODO: substituir este store de demonstração pelos endpoints de monitoramento do backend.
export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  elders: [
    { id: '1', nome: 'Maria Silva', status: 'normal', batimento: 76, temperatura: 36.4, telefone: '(11) 98888-1234', ultimaAtualizacao: 'há 2 minutos' },
    { id: '2', nome: 'José Oliveira', status: 'atencao', batimento: 112, temperatura: 37.8, telefone: '(11) 97777-4321', ultimaAtualizacao: 'há 1 minuto' },
  ],
  caregivers: [
    { id: '1', nome: 'Ana Pereira', vinculadoDesde: 'desde jan/2026' },
    { id: '2', nome: 'Carlos Souza', vinculadoDesde: 'desde mar/2026' },
  ],
  alerts: [
    { id: '1', idosoId: '2', idosoNome: 'José Oliveira', tipo: 'batimento', valor: 128, horario: 'Hoje, 14:32', status: 'novo' },
    { id: '2', idosoId: '1', idosoNome: 'Maria Silva', tipo: 'temperatura', valor: 38.2, horario: 'Ontem, 21:10', status: 'visto' },
    { id: '3', idosoId: '2', idosoNome: 'José Oliveira', tipo: 'batimento', valor: 122, horario: 'Ontem, 09:47', status: 'resolvido' },
  ],
  limitsByElder: { '1': defaultLimits, '2': defaultLimits },
  addElderByCode: (code) => {
    if (get().elders.some((elder) => elder.id === `code-${code}`)) return false;
    set((state) => ({
      elders: [...state.elders, {
        id: `code-${code}`,
        nome: 'Antônio Santos',
        status: 'normal',
        batimento: 74,
        temperatura: 36.6,
        telefone: '(11) 96666-7890',
        ultimaAtualizacao: 'agora',
      }],
      limitsByElder: { ...state.limitsByElder, [`code-${code}`]: defaultLimits },
    }));
    return true;
  },
  removeCaregiver: (id) => set((state) => ({ caregivers: state.caregivers.filter((caregiver) => caregiver.id !== id) })),
  updateAlertStatus: (id, status) => set((state) => ({ alerts: state.alerts.map((alert) => alert.id === id ? { ...alert, status } : alert) })),
  updateLimits: (elderId, limits) => set((state) => ({
    limitsByElder: {
      ...state.limitsByElder,
      [elderId]: { ...limits, updatedBy: 'Ana Pereira', updatedAt: 'agora' },
    },
  })),
}));
