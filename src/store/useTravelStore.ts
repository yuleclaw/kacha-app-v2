import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Travel, TravelDay, TravelActivity, TravelExpense } from '../types'

interface TravelStore {
  items: Travel[]
  add: (item: Travel) => void
  update: (id: string, data: Partial<Travel>) => void
  remove: (id: string) => void
  getById: (id: string) => Travel | undefined
  addDay: (travelId: string, day: TravelDay) => void
  addActivity: (travelId: string, dayId: string, activity: TravelActivity) => void
  updateActivity: (travelId: string, dayId: string, activityId: string, data: Partial<TravelActivity>) => void
  removeActivity: (travelId: string, dayId: string, activityId: string) => void
  addExpense: (travelId: string, expense: TravelExpense) => void
}

export const useTravelStore = create<TravelStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      update: (id, data) =>
        set((s) => ({
          items: s.items.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
      getById: (id) => get().items.find((t) => t.id === id),
      addDay: (travelId, day) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === travelId ? { ...t, days: [...t.days, day] } : t,
          ),
        })),
      addActivity: (travelId, dayId, activity) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === travelId
              ? { ...t, days: t.days.map((d) =>
                  d.id === dayId ? { ...d, activities: [...d.activities, activity] } : d) }
              : t,
          ),
        })),
      updateActivity: (travelId, dayId, activityId, data) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === travelId
              ? { ...t, days: t.days.map((d) =>
                  d.id === dayId
                    ? { ...d, activities: d.activities.map((a) =>
                        a.id === activityId ? { ...a, ...data } : a) }
                    : d) }
              : t,
          ),
        })),
      removeActivity: (travelId, dayId, activityId) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === travelId
              ? { ...t, days: t.days.map((d) =>
                  d.id === dayId
                    ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) }
                    : d) }
              : t,
          ),
        })),
      addExpense: (travelId, expense) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === travelId
              ? { ...t, expenses: [...(t.expenses || []), expense] }
              : t,
          ),
        })),
    }),
    {
      name: 'kacha_travel',
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          return {
            ...persisted,
            items: (persisted.items || []).map((item: any) => ({
              ...item,
              createdAt: item.createdAt || Date.now(),
            })),
          }
        }
        return persisted as TravelStore
      },
    },
  ),
)
