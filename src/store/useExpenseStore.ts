import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExpenseItem } from '../types'

interface ExpenseStore {
  items: ExpenseItem[]
  add: (item: ExpenseItem) => void
  update: (id: string, data: Partial<ExpenseItem>) => void
  remove: (id: string) => void
  getAll: () => ExpenseItem[]
  getByMonth: (year: number, month: number) => ExpenseItem[]
  getStats: () => { total: number; pending: number; approved: number; transportKm: number }
}

export const useExpenseStore = create<ExpenseStore>()(
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
      getByMonth: (year, month) =>
        get().items.filter((i) => {
          const d = new Date(i.date)
          return d.getFullYear() === year && d.getMonth() + 1 === month
        }),
      getStats: () => {
        const all = get().items
        return {
          total: all.reduce((s, i) => s + i.amount, 0),
          pending: all.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
          approved: all.filter((i) => i.status === 'approved').reduce((s, i) => s + i.amount, 0),
          transportKm: all.filter((i) => i.category === 'transport').reduce((s, i) => s + (i.km || 0), 0),
        }
      },
    }),
    { name: 'kacha_expense' },
  ),
)
