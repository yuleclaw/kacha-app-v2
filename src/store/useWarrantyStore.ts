import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WarrantyItem } from '../types'
import { isExpired, isExpiringSoon } from '../utils/date'

interface WarrantyStore {
  items: WarrantyItem[]
  add: (item: WarrantyItem) => void
  update: (id: string, data: Partial<WarrantyItem>) => void
  remove: (id: string) => void
  getAll: () => WarrantyItem[]
  getExpired: () => WarrantyItem[]
  getExpiringSoon: (days?: number) => WarrantyItem[]
  getValid: () => WarrantyItem[]
}

export const useWarrantyStore = create<WarrantyStore>()(
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
      getExpired: () => get().items.filter((i) => isExpired(i.warrantyExpiry)),
      getExpiringSoon: (days = 30) => get().items.filter((i) => isExpiringSoon(i.warrantyExpiry, days)),
      getValid: () => get().items.filter((i) => !isExpired(i.warrantyExpiry)),
    }),
    { name: 'kacha_warranty' },
  ),
)
