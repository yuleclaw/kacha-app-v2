import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface SettingsStore {
  settings: AppSettings
  update: (data: Partial<AppSettings>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },
      update: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),
      reset: () => set({ settings: { ...DEFAULT_SETTINGS } }),
    }),
    { name: 'kacha_settings' },
  ),
)
