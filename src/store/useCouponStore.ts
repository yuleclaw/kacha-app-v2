import { create } from 'zustand'
import { Coupon } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId, isExpired, isExpiringSoon } from '@/utils/date'

interface CouponStore {
  items: Coupon[]
  load: () => void
  add: (item: Omit<Coupon, 'id'>) => void
  update: (id: string, item: Partial<Coupon>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getAvailable: () => Coupon[]
  getExpiringSoon: (days?: number) => Coupon[]
  getExpired: () => Coupon[]
}

export const useCouponStore = create<CouponStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<Coupon[]>(STORAGE_KEYS.COUPONS, [])
    set({ items })
  },

  add: (item) => {
    const newItem: Coupon = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.COUPONS, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.COUPONS, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.COUPONS, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.COUPONS, items)
  },

  getAvailable: () => get().items.filter(i => !isExpired(i.expiryDate)).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
  getExpiringSoon: (days = 3) => get().items.filter(i => isExpiringSoon(i.expiryDate, days) && !isExpired(i.expiryDate)).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
  getExpired: () => get().items.filter(i => isExpired(i.expiryDate)),
}))
