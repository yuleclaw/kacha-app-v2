import { create } from 'zustand'
import { AppSettings, DEFAULT_SETTINGS } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

interface SettingsStore {
  settings: AppSettings
  load: () => void
  update: (updates: Partial<AppSettings>) => void
  toggleTheme: () => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  load: () => {
    const settings = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    set({ settings })
  },

  update: (updates) => {
    const settings = { ...get().settings, ...updates }
    set({ settings })
    saveToStorage(STORAGE_KEYS.SETTINGS, settings)
  },

  toggleTheme: () => {
    const settings = { ...get().settings, theme: get().settings.theme === 'light' ? 'dark' : 'light' }
    set({ settings })
    saveToStorage(STORAGE_KEYS.SETTINGS, settings)
    document.documentElement.setAttribute('data-theme', settings.theme)
  },
}))
