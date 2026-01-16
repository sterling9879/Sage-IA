import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toast } from '@/types';

interface UIStore {
  // State
  sidebarOpen: boolean;
  modelPickerOpen: boolean;
  searchOpen: boolean;
  settingsOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleModelPicker: () => void;
  setModelPickerOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      modelPickerOpen: false,
      searchOpen: false,
      settingsOpen: false,
      theme: 'system',
      toasts: [],

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleModelPicker: () =>
        set((state) => ({ modelPickerOpen: !state.modelPickerOpen })),
      setModelPickerOpen: (open) => set({ modelPickerOpen: open }),

      toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
      setSearchOpen: (open) => set({ searchOpen: open }),

      toggleSettings: () =>
        set((state) => ({ settingsOpen: !state.settingsOpen })),
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      setTheme: (theme) => set({ theme }),

      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: Date.now().toString() },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);
