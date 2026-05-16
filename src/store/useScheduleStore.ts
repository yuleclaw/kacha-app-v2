import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Schedule } from '../types'

interface ScheduleStore {
  items: Schedule[]
  add: (item: Schedule) => void
  update: (id: string, data: Partial<Schedule>) => void
  remove: (id: string) => void
  getByDate: (date: string) => Schedule[]
  getToday: () => Schedule[]
  parsePastedText: (text: string) => { title: string; startTime: string; location: string } | null
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
      getByDate: (date) => get().items.filter((s) => s.startTime.startsWith(date)),
      getToday: () => {
        const today = new Date().toISOString().slice(0, 10)
        return get().items.filter((s) => s.startTime.startsWith(today))
      },
      parsePastedText: (text) => {
        const lines = text.trim().split('\n')
        if (lines.length === 0) return null
        const title = lines[0]?.trim() || ''
        const timeMatch = text.match(/(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2})/)
        const locMatch = text.match(/地点[：:]\s*(.+)/)
        return {
          title,
          startTime: timeMatch?.[1] || new Date().toISOString().slice(0, 16),
          location: locMatch?.[1]?.trim() || '',
        }
      },
    }),
    { name: 'kacha_schedule' },
  ),
)
