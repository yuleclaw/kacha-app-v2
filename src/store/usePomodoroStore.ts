import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TimerStatus = 'idle' | 'running' | 'paused'
type TimerMode = 'work' | 'break'

interface PomodoroStore {
  mode: TimerMode
  status: TimerStatus
  workMinutes: number
  breakMinutes: number
  secondsLeft: number
  completedToday: number
  whiteNoiseType: 'rain' | 'ocean' | 'forest' | 'cafe' | 'none'
  whiteNoiseEnabled: boolean
  setMode: (mode: TimerMode) => void
  setStatus: (status: TimerStatus) => void
  setWorkMinutes: (m: number) => void
  setBreakMinutes: (m: number) => void
  setSecondsLeft: (s: number) => void
  setCompletedToday: (n: number) => void
  incrementCompleted: () => void
  setWhiteNoise: (type: 'rain' | 'ocean' | 'forest' | 'cafe' | 'none') => void
  toggleWhiteNoise: () => void
  reset: () => void
}

const DEFAULT_WORK = 25
const DEFAULT_BREAK = 5

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      // Persisted state
      mode: 'work',
      status: 'idle',
      workMinutes: DEFAULT_WORK,
      breakMinutes: DEFAULT_BREAK,
      // Non-persisted (transient, restored on app start)
      secondsLeft: DEFAULT_WORK * 60,
      completedToday: 0,
      whiteNoiseType: 'none',
      whiteNoiseEnabled: false,

      setMode: (mode) => set({ mode }),
      setStatus: (status) => set({ status }),
      setWorkMinutes: (m) => { const s = m * 60; set({ workMinutes: m, secondsLeft: s }) },
      setBreakMinutes: (m) => set({ breakMinutes: m }),
      setSecondsLeft: (s) => set({ secondsLeft: s }),
      setCompletedToday: (n) => set({ completedToday: n }),
      incrementCompleted: () => set((s) => ({ completedToday: s.completedToday + 1 })),
      setWhiteNoise: (type) => set({ whiteNoiseType: type, whiteNoiseEnabled: type !== 'none' }),
      toggleWhiteNoise: () => set((s) => ({ whiteNoiseEnabled: !s.whiteNoiseEnabled })),
      reset: () => set({
        mode: 'work',
        status: 'idle',
        secondsLeft: get().workMinutes * 60,
      }),
    }),
    {
      name: 'kacha_pomodoro',
      // Only persist settings, not running state
      partialize: (state) => ({
        workMinutes: state.workMinutes,
        breakMinutes: state.breakMinutes,
        completedToday: state.completedToday,
        whiteNoiseType: state.whiteNoiseType,
        whiteNoiseEnabled: state.whiteNoiseEnabled,
      }),
      // On rehydrate, restore secondsLeft from persisted workMinutes
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.secondsLeft = state.workMinutes * 60
          state.mode = 'work'
          state.status = 'idle'
        }
      },
    },
  ),
)
