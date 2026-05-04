import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlashSale } from '../types'

interface FlashStore {
  items: FlashSale[]
  add: (item: FlashSale) => void
  update: (id: string, data: Partial<FlashSale>) => void
  remove: (id: string) => void
  getAll: () => FlashSale[]
}

export const useFlashStore = create<FlashStore>()(
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
    }),
    { name: 'kacha_flash' },
  ),
)
