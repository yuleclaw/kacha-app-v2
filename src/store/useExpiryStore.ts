import { create } from 'zustand'
import { ExpiryItem } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId, isExpired, isExpiringSoon } from '@/utils/date'

interface ExpiryStore {
  items: ExpiryItem[]
  load: () => void
  add: (item: Omit<ExpiryItem, 'id'>) => void
  update: (id: string, item: Partial<ExpiryItem>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getExpired: () => ExpiryItem[]
  getExpiringSoon: (days?: number) => ExpiryItem[]
  getNormal: () => ExpiryItem[]
}

export const useExpiryStore = create<ExpiryStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<ExpiryItem[]>(STORAGE_KEYS.EXPIRY_ITEMS, [])
    set({ items })
  },

  add: (item) => {
    const newItem: ExpiryItem = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPIRY_ITEMS, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPIRY_ITEMS, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPIRY_ITEMS, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.EXPIRY_ITEMS, items)
  },

  getExpired: () => get().items.filter(i => isExpired(i.expiryDate)),
  getExpiringSoon: (days = 7) => get().items.filter(i => isExpiringSoon(i.expiryDate, days) && !isExpired(i.expiryDate)),
  getNormal: () => get().items.filter(i => !isExpiringSoon(i.expiryDate, 7) && !isExpired(i.expiryDate)),
}))
