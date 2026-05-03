import { create } from 'zustand'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

interface PomodoroRecord {
  date: string
  count: number
}

interface PomodoroStore {
  records: PomodoroRecord[]
  load: () => void
  addToday: () => void
  getTodayCount: () => number
  getWeekCount: () => number
  getMonthCount: () => number
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  records: [],

  load: () => {
    const records = loadFromStorage<PomodoroRecord[]>(STORAGE_KEYS.POMODORO, [])
    set({ records })
  },

  addToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const records = [...get().records]
    const existing = records.find(r => r.date === today)
    if (existing) {
      existing.count++
    } else {
      records.push({ date: today, count: 1 })
    }
    set({ records })
    saveToStorage(STORAGE_KEYS.POMODORO, records)
  },

  getTodayCount: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().records.find(r => r.date === today)?.count || 0
  },

  getWeekCount: () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return get().records
      .filter(r => new Date(r.date) >= weekAgo)
      .reduce((sum, r) => sum + r.count, 0)
  },

  getMonthCount: () => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return get().records
      .filter(r => new Date(r.date) >= monthAgo)
      .reduce((sum, r) => sum + r.count, 0)
  },
}))
