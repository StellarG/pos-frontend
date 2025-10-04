import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState, StoreSettings } from '@/types';

const defaultSettings: StoreSettings = {
  storeName: 'My Store',
  storeAddress: '123 Main Street, City, State 12345',
  storePhone: '(555) 123-4567',
  taxRate: 0.08, // 8%
  currency: 'USD',
  receiptFooter: 'Thank you for your business!',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSettings: (updates: Partial<StoreSettings>) => {
        set({
          settings: { ...get().settings, ...updates }
        });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);