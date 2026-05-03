import { create } from 'zustand'
import { WarrantyItem } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId, isExpired, isExpiringSoon } from '@/utils/date'

interface WarrantyStore {
  items: WarrantyItem[]
  load: () => void
  add: (item: Omit<WarrantyItem, 'id'>) => void
  update: (id: string, item: Partial<WarrantyItem>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getExpired: () => WarrantyItem[]
  getExpiringSoon: (days?: number) => WarrantyItem[]
}

export const useWarrantyStore = create<WarrantyStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<WarrantyItem[]>(STORAGE_KEYS.WARRANTIES, [])
    set({ items })
  },

  add: (item) => {
    const newItem: WarrantyItem = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.WARRANTIES, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.WARRANTIES, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.WARRANTIES, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.WARRANTIES, items)
  },

  getExpired: () => get().items.filter(i => isExpired(i.warrantyExpiry)),
  getExpiringSoon: (days = 30) => get().items.filter(i => isExpiringSoon(i.warrantyExpiry, days) && !isExpired(i.warrantyExpiry)),
}))
