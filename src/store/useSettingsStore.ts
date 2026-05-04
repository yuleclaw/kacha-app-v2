import { create } from 'zustand'
import { AppSettings, DEFAULT_SETTINGS } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

interface SettingsStore {
  settings: AppSettings
  load: () => void
  update: (updates: Partial<AppSettings>) => void
  toggleTheme: () => void
}

function validateSettings(raw: Record<string, unknown>): AppSettings {
  return {
    theme: (raw.theme === 'light' || raw.theme === 'dark') ? raw.theme : DEFAULT_SETTINGS.theme,
    pomodoroWork: typeof raw.pomodoroWork === 'number' ? raw.pomodoroWork : DEFAULT_SETTINGS.pomodoroWork,
    pomodoroBreak: typeof raw.pomodoroBreak === 'number' ? raw.pomodoroBreak : DEFAULT_SETTINGS.pomodoroBreak,
    dndEnabled: typeof raw.dndEnabled === 'boolean' ? raw.dndEnabled : DEFAULT_SETTINGS.dndEnabled,
    dndStart: typeof raw.dndStart === 'string' ? raw.dndStart : DEFAULT_SETTINGS.dndStart,
    dndEnd: typeof raw.dndEnd === 'string' ? raw.dndEnd : DEFAULT_SETTINGS.dndEnd,
    floatingWindowEnabled: typeof raw.floatingWindowEnabled === 'boolean' ? raw.floatingWindowEnabled : DEFAULT_SETTINGS.floatingWindowEnabled,
    ocrServerUrl: typeof raw.ocrServerUrl === 'string' ? raw.ocrServerUrl : DEFAULT_SETTINGS.ocrServerUrl,
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  load: () => {
    const raw = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    const settings = validateSettings(raw as unknown as Record<string, unknown>)
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