import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Coupon } from '../types'
import { isExpired, isExpiringSoon } from '../utils/date'

interface CouponStore {
  items: Coupon[]
  add: (item: Coupon) => void
  update: (id: string, data: Partial<Coupon>) => void
  remove: (id: string) => void
  getAll: () => Coupon[]
  getExpired: () => Coupon[]
  getExpiringSoon: (days?: number) => Coupon[]
  getAvailable: () => Coupon[]
}

export const useCouponStore = create<CouponStore>()(
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
      getAvailable: () => get().items.filter((i) => !isExpired(i.expiryDate)),
    }),
    { name: 'kacha_coupon' },
  ),
)
