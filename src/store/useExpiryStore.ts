import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExpiryItem } from '../types'
import { isExpired, isExpiringSoon } from '../utils/date'

interface ExpiryStore {
  items: ExpiryItem[]
  add: (item: ExpiryItem) => void
  update: (id: string, data: Partial<ExpiryItem>) => void
  remove: (id: string) => void
  getAll: () => ExpiryItem[]
  getExpired: () => ExpiryItem[]
  getExpiringSoon: (days?: number) => ExpiryItem[]
  getNormal: () => ExpiryItem[]
}

export const useExpiryStore = create<ExpiryStore>()(
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
      getExpired: () => get().items.filter((i) => isExpired(i.expiryDate)),
      getExpiringSoon: (days = 7) => get().items.filter((i) => isExpiringSoon(i.expiryDate, days)),
      getNormal: () => get().items.filter((i) => !isExpired(i.expiryDate) && !isExpiringSoon(i.expiryDate, 7)),
    }),
    { name: 'kacha_expiry' },
  ),
)
