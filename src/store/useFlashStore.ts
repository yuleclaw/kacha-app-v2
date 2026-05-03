import { create } from 'zustand'
import { FlashSale } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId, isExpired } from '@/utils/date'

interface FlashStore {
  items: FlashSale[]
  load: () => void
  add: (item: Omit<FlashSale, 'id'>) => void
  update: (id: string, item: Partial<FlashSale>) => void
  remove: (id: string) => void
  toggleNotify: (id: string) => void
  getUpcoming: () => FlashSale[]
  getActive: () => FlashSale[]
}

export const useFlashStore = create<FlashStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<FlashSale[]>(STORAGE_KEYS.FLASH_SALES, [])
    set({ items })
  },

  add: (item) => {
    const newItem: FlashSale = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.FLASH_SALES, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.FLASH_SALES, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.FLASH_SALES, items)
  },

  toggleNotify: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, notifyEnabled: !i.notifyEnabled } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.FLASH_SALES, items)
  },

  getUpcoming: () => {
    const now = new Date()
    return get().items
      .filter(i => i.notifyEnabled && new Date(i.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  },

  getActive: () => {
    const now = new Date()
    return get().items
      .filter(i => !isExpired(i.startTime) || new Date(i.startTime).toDateString() === now.toDateString())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  },
}))
