import { create } from 'zustand';

type AuthState = {
  user: null | { id: string; nome: string; tipo: 'idoso' | 'cuidador' };
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));