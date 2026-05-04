import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense } from '../types'

interface ExpenseStore {
  items: Expense[]
  add: (item: Expense) => void
  update: (id: string, data: Partial<Expense>) => void
  remove: (id: string) => void
  getAll: () => Expense[]
  getByMonth: (year: number, month: number) => Expense[]
  getStats: () => { total: number; pending: number; approved: number }
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
          total: all.reduce((sum, i) => sum + i.amount, 0),
          pending: all.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
          approved: all.filter((i) => i.status === 'approved').reduce((sum, i) => sum + i.amount, 0),
        }
      },
    }),
    { name: 'kacha_expense' },
  ),
)
