import { create } from 'zustand'
import { Expense } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId } from '@/utils/date'

interface ExpenseStore {
  items: Expense[]
  load: () => void
  add: (item: Omit<Expense, 'id' | 'createdAt'>) => void
  update: (id: string, item: Partial<Expense>) => void
  remove: (id: string) => void
  updateStatus: (id: string, status: Expense['status']) => void
  getMonthly: (year: number, month: number) => Expense[]
  getStats: () => { total: number; pending: number; approved: number; rejected: number }
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, [])
    set({ items })
  },

  add: (item) => {
    const newItem: Expense = { ...item, id: generateId(), createdAt: Date.now() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPENSES, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPENSES, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPENSES, items)
  },

  updateStatus: (id, status) => {
    const items = get().items.map(i => i.id === id ? { ...i, status } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPENSES, items)
  },

  getMonthly: (year, month) => {
    return get().items.filter(i => {
      const d = new Date(i.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  },

  getStats: () => {
    const items = get().items
    return {
      total: items.reduce((sum, i) => sum + i.amount, 0),
      pending: items.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
      approved: items.filter(i => i.status === 'approved').reduce((sum, i) => sum + i.amount, 0),
      rejected: items.filter(i => i.status === 'rejected').reduce((sum, i) => sum + i.amount, 0),
    }
  },
}))
