import { create } from 'zustand'
import { Schedule } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId, isToday } from '@/utils/date'

interface ScheduleStore {
  items: Schedule[]
  load: () => void
  add: (item: Omit<Schedule, 'id'>) => void
  update: (id: string, item: Partial<Schedule>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getToday: () => Schedule[]
  getUpcoming: (limit?: number) => Schedule[]
  getByDate: (date: string) => Schedule[]
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<Schedule[]>(STORAGE_KEYS.SCHEDULES, [])
    set({ items })
  },

  add: (item) => {
    const newItem: Schedule = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.SCHEDULES, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.SCHEDULES, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.SCHEDULES, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.SCHEDULES, items)
  },

  getToday: () => {
    return get().items.filter(i => isToday(i.startTime)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  },

  getUpcoming: (limit = 10) => {
    const now = new Date()
    return get().items
      .filter(i => new Date(i.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit)
  },

  getByDate: (date) => {
    return get().items.filter(i => i.startTime.startsWith(date)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  },
}))
