import { create } from 'zustand'
import { Anniversary } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId } from '@/utils/date'
import { getNextLunarDate } from '@/utils/lunar'

export interface UpcomingAnniversary extends Anniversary {
  nextDate: string
  days: number
}

interface AnniversaryStore {
  items: Anniversary[]
  load: () => void
  add: (item: Omit<Anniversary, 'id'>) => void
  update: (id: string, item: Partial<Anniversary>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getUpcoming: (limit?: number) => UpcomingAnniversary[]
}

export const useAnniversaryStore = create<AnniversaryStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<Anniversary[]>(STORAGE_KEYS.ANNIVERSARIES, [])
    set({ items })
  },

  add: (item) => {
    const newItem: Anniversary = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.ANNIVERSARIES, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.ANNIVERSARIES, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.ANNIVERSARIES, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.ANNIVERSARIES, items)
  },

  getUpcoming: (limit = 3) => {
    const items = get().items.filter(i => i.notifyEnabled)
    return items
      .map(item => {
        let nextDate: string
        if (item.lunar && item.repeatYearly) {
          const [m, d] = item.date.split('-').slice(1).map(Number)
          nextDate = getNextLunarDate(m, d)
        } else {
          nextDate = item.date
        }
        const now = new Date()
        const target = new Date(nextDate)
        if (item.repeatYearly && target < now) {
          target.setFullYear(now.getFullYear())
          if (target < now) target.setFullYear(now.getFullYear() + 1)
          nextDate = target.toISOString().split('T')[0]
        }
        const days = Math.ceil((target.getTime() - now.getTime()) / 86400000)
        return { ...item, nextDate, days }
      })
      .sort((a, b) => a.days - b.days)
      .slice(0, limit)
  },
}))