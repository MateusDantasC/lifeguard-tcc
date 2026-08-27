import { create } from 'zustand';
import { setApiToken } from '../services/api';

export type ElderProfile = {
  dataNascimento?: string | null;
  tipoSanguineo?: string | null;
  alergias?: string | null;
  medicamentos?: string | null;
  condicoesMedicas?: string | null;
  observacoesImportantes?: string | null;
  contatoEmergenciaNome?: string | null;
  contatoEmergenciaTelefone?: string | null;
};

export type AuthUser = {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
    foto?: string | null;
    tipo: 'idoso' | 'cuidador';
    perfilIdoso?: ElderProfile | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: NonNullable<AuthState['user']>) => void;
  setUser: (user: AuthState['user']) => void;
  updateUser: (data: Partial<NonNullable<AuthState['user']>>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setSession: (token, user) => {
    setApiToken(token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
  logout: () => {
    setApiToken(null);
    set({ user: null, token: null });
  },
}));
