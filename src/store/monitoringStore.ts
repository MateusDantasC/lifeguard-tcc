import { create } from 'zustand';
import type { StatusKey } from '../theme/theme';

export type Elder = {
  id: string;
  nome: string;
  status: StatusKey;
  batimento: number | null;
  temperatura: number | null;
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

export type Caregiver = { id: string; usuarioId: string; nome: string; telefone: string; vinculadoDesde: string };

type MonitoringState = {
  elders: Elder[];
  caregivers: Caregiver[];
  alerts: MonitoringAlert[];
  limitsByElder: Record<string, AlertLimits>;
  setElders: (elders: Elder[]) => void;
  upsertElder: (elder: Elder) => void;
  setCaregivers: (caregivers: Caregiver[]) => void;
  setAlerts: (alerts: MonitoringAlert[]) => void;
  setLimits: (elderId: string, limits: AlertLimits) => void;
  reset: () => void;
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

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  elders: [],
  caregivers: [],
  alerts: [],
  limitsByElder: {},
  setElders: (elders) => set({ elders }),
  upsertElder: (elder) => set((state) => ({ elders: [...state.elders.filter((item) => item.id !== elder.id), elder] })),
  setCaregivers: (caregivers) => set({ caregivers }),
  setAlerts: (alerts) => set({ alerts }),
  setLimits: (elderId, limits) => set((state) => ({ limitsByElder: { ...state.limitsByElder, [elderId]: limits } })),
  reset: () => set({ elders: [], caregivers: [], alerts: [], limitsByElder: {} }),
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
