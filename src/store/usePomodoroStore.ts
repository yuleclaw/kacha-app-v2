import { create } from 'zustand'

type TimerStatus = 'idle' | 'running' | 'paused'
type TimerMode = 'work' | 'break'

interface PomodoroStore {
  mode: TimerMode
  status: TimerStatus
  workMinutes: number
  breakMinutes: number
  secondsLeft: number
  completedToday: number
  setMode: (mode: TimerMode) => void
  setStatus: (status: TimerStatus) => void
  setWorkMinutes: (m: number) => void
  setBreakMinutes: (m: number) => void
  setSecondsLeft: (s: number) => void
  setCompletedToday: (n: number) => void
  incrementCompleted: () => void
  reset: () => void
}

export const usePomodoroStore = create<PomodoroStore>()((set, get) => ({
  mode: 'work',
  status: 'idle',
  workMinutes: 25,
  breakMinutes: 5,
  secondsLeft: 25 * 60,
  completedToday: 0,
  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  setWorkMinutes: (m) => set({ workMinutes: m, secondsLeft: m * 60 }),
  setBreakMinutes: (m) => set({ breakMinutes: m }),
  setSecondsLeft: (s) => set({ secondsLeft: s }),
  setCompletedToday: (n) => set({ completedToday: n }),
  incrementCompleted: () => set((s) => ({ completedToday: s.completedToday + 1 })),
  reset: () => set({
    mode: 'work',
    status: 'idle',
    secondsLeft: get().workMinutes * 60,
  }),
}))
