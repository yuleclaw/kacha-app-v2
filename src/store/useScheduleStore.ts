import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Schedule } from '../types'
import { isTodayDate } from '../utils/date'

interface ScheduleStore {
  items: Schedule[]
  add: (item: Schedule) => void
  update: (id: string, data: Partial<Schedule>) => void
  remove: (id: string) => void
  getAll: () => Schedule[]
  getToday: () => Schedule[]
  getByDate: (date: string) => Schedule[]
}

export const useScheduleStore = create<ScheduleStore>()(
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
      getToday: () => get().items.filter((s) => s.startTime.startsWith(new Date().toISOString().slice(0, 10))),
      getByDate: (date) => get().items.filter((s) => s.startTime.startsWith(date)),
    }),
    { name: 'kacha_schedule' },
  ),
)
