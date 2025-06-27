import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@shared/schema';

interface AppState {
  user: User | null;
  focusModeEnabled: boolean;
  theme: string;
  setUser: (user: User | null) => void;
  setFocusMode: (enabled: boolean) => void;
  setTheme: (theme: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      focusModeEnabled: false,
      theme: 'light',
      setUser: (user) => set({ user }),
      setFocusMode: (focusModeEnabled) => set({ focusModeEnabled }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'myverse-storage',
    }
  )
);
