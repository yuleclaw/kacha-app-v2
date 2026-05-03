import { create } from 'zustand'
import { Travel } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId } from '@/utils/date'

interface TravelStore {
  items: Travel[]
  load: () => void
  add: (item: Omit<Travel, 'id'>) => void
  update: (id: string, item: Partial<Travel>) => void
  remove: (id: string) => void
  updateStatus: (id: string, status: Travel['status']) => void
  addDay: (travelId: string, day: Omit<import('@/types').TravelDay, 'id'>) => void
  addActivity: (travelId: string, dayId: string, activity: Omit<import('@/types').Activity, 'id'>) => void
  removeActivity: (travelId: string, dayId: string, activityId: string) => void
  getOngoing: () => Travel[]
  getUpcoming: () => Travel[]
}

export const useTravelStore = create<TravelStore>((set, get) => ({
  items: [],

  load: () => {
    const items = loadFromStorage<Travel[]>(STORAGE_KEYS.TRAVELS, [])
    set({ items })
  },

  add: (item) => {
    const newItem: Travel = { ...item, id: generateId() }
    const items = [...get().items, newItem]
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  update: (id, updates) => {
    const items = get().items.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  updateStatus: (id, status) => {
    const items = get().items.map(i => i.id === id ? { ...i, status } : i)
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  addDay: (travelId, day) => {
    const items = get().items.map(i => {
      if (i.id !== travelId) return i
      const newDay = { ...day, id: generateId() }
      return { ...i, days: [...i.days, newDay].sort((a, b) => a.date.localeCompare(b.date)) }
    })
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  addActivity: (travelId, dayId, activity) => {
    const items = get().items.map(i => {
      if (i.id !== travelId) return i
      const days = i.days.map(d => {
        if (d.id !== dayId) return d
        const newActivity = { ...activity, id: generateId() }
        return { ...d, activities: [...d.activities, newActivity].sort((a, b) => a.time.localeCompare(b.time)) }
      })
      return { ...i, days }
    })
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  removeActivity: (travelId, dayId, activityId) => {
    const items = get().items.map(i => {
      if (i.id !== travelId) return i
      const days = i.days.map(d => {
        if (d.id !== dayId) return d
        return { ...d, activities: d.activities.filter(a => a.id !== activityId) }
      })
      return { ...i, days }
    })
    set({ items })
    saveToStorage(STORAGE_KEYS.TRAVELS, items)
  },

  getOngoing: () => get().items.filter(i => i.status === 'ongoing'),
  getUpcoming: () => get().items.filter(i => i.status === 'planning').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
}))
