import type { AuthState, User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrator',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    username: 'cashier',
    name: 'Cashier User',
    role: 'cashier',
    isActive: true,
    createdAt: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string): Promise<boolean> => {
        // Mock authentication - in real app, this would call an API
        if (username === 'admin' && password === 'admin') {
          const user = mockUsers.find(u => u.username === username);
          if (user) {
            set({ user, isAuthenticated: true });
            return true;
          }
        }

        if (username === 'cashier' && password === 'cashier') {
          const user = mockUsers.find(u => u.username === username);
          if (user) {
            set({ user, isAuthenticated: true });
            return true;
          }
        }

        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.user?.createdAt) {
          // Convert date string back to Date object after rehydration
          state.user.createdAt = new Date(state.user.createdAt);
        }
      },
    }
  )
);