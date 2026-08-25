import { create } from 'zustand';
import { setApiToken } from '../services/api';

type AuthState = {
  user: null | {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    tipo: 'idoso' | 'cuidador';
  };
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
