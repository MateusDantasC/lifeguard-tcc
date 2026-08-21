import { create } from 'zustand';

type AuthState = {
  user: null | {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    tipo: 'idoso' | 'cuidador';
  };
  setUser: (user: AuthState['user']) => void;
  updateUser: (data: Partial<NonNullable<AuthState['user']>>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
  logout: () => set({ user: null }),
}));
