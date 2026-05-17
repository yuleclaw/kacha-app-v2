import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExpiryItem } from '../types'
import { isExpired, isExpiringSoon } from '../utils/date'

interface ExpiryStore {
  _version?: number
  items: ExpiryItem[]
  add: (item: ExpiryItem) => void
  update: (id: string, data: Partial<ExpiryItem>) => void
  remove: (id: string) => void
  getAll: () => ExpiryItem[]
  getByCategory: (cat: string) => ExpiryItem[]
  getExpired: () => ExpiryItem[]
  getExpiringSoon: (days?: number) => ExpiryItem[]
  getNormal: () => ExpiryItem[]
}

export const useExpiryStore = create<ExpiryStore>()(
  persist(
    (set, get) => ({
      _version: 1,
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      update: (id, data) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      getAll: () => get().items,
      getByCategory: (cat) => get().items.filter((i) => i.category === cat),
      getExpired: () => get().items.filter((i) => isExpired(i.expiryDate)),
      getExpiringSoon: (days = 7) => get().items.filter((i) => isExpiringSoon(i.expiryDate, days)),
      getNormal: () => get().items.filter((i) => !isExpired(i.expiryDate) && !isExpiringSoon(i.expiryDate, 7)),
    }),
    {
      name: 'kacha_expiry',
      version: 1,
      migrate: (persisted: any, version: number) => {
        // Version 0 -> 1: ensure all items have type field
        if (version === 0) {
          return {
            _version: 1,
            items: (persisted.items || []).map((item: any) => ({
              ...item,
              type: item.type || 'shelfLife',
              category: item.category || 'other',
              createdAt: item.createdAt || Date.now(),
            })),
          }
        }
        return persisted as ExpiryStore
      },
    },
  ),
)
