import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Anniversary } from '../types'
import { daysFromToday, getNextOccurrence } from '../utils/date'

export interface UpcomingAnniversary extends Anniversary {
  nextDate: string
  days: number
}

interface AnniversaryStore {
  items: Anniversary[]
  add: (item: Anniversary) => void
  update: (id: string, data: Partial<Anniversary>) => void
  remove: (id: string) => void
  getAll: () => Anniversary[]
  getUpcoming: (limit?: number) => UpcomingAnniversary[]
}

export const useAnniversaryStore = create<AnniversaryStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      update: (id, data) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      getAll: () => get().items,
      getUpcoming: (limit = 3) => {
        const items = get().items
        const withCalc = items.map((a) => {
          const nextDate = getNextOccurrence(a.date, a.lunar)
          const days = daysFromToday(nextDate)
          return { ...a, nextDate, days }
        })
        withCalc.sort((a, b) => a.days - b.days)
        return withCalc.slice(0, limit)
      },
    }),
    { name: 'kacha_anniversaries' },
  ),
)
