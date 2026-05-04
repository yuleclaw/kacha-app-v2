import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { usePomodoroStore } from '../store/usePomodoroStore'

interface PomodoroPageProps {
  onBack: () => void
}

export default function PomodoroPage({ onBack }: PomodoroPageProps) {
  const store = usePomodoroStore()
  const [showSettings, setShowSettings] = useState(false)
  const [customWork, setCustomWork] = useState(store.workMinutes)
  const [customBreak, setCustomBreak] = useState(store.breakMinutes)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (store.status === 'running') {
      intervalRef.current = setInterval(() => {
        const s = usePomodoroStore.getState()
        if (s.secondsLeft <= 1) {
          // Switch mode
          if (s.mode === 'work') {
            store.setMode('break')
            store.setSecondsLeft(store.breakMinutes * 60)
            store.incrementCompleted()
          } else {
            store.setMode('work')
            store.setSecondsLeft(store.workMinutes * 60)
          }
          store.setStatus('idle')
        } else {
          store.setSecondsLeft(s.secondsLeft - 1)
        }
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [store.status])

  const minutes = Math.floor(store.secondsLeft / 60)
  const seconds = store.secondsLeft % 60
  const progress = store.mode === 'work'
    ? (store.workMinutes * 60 - store.secondsLeft) / (store.workMinutes * 60) * 100
    : (store.breakMinutes * 60 - store.secondsLeft) / (store.breakMinutes * 60) * 100

  const handleStart = () => {
    if (store.secondsLeft === 0) {
      store.setSecondsLeft(store.mode === 'work' ? store.workMinutes * 60 : store.breakMinutes * 60)
    }
    store.setStatus('running')
  }

  return (
    <>
      <PageHeader title="🍅 番茄钟" onBack={onBack} right={
        <button className="btn btn-sm btn-ghost" onClick={() => { setCustomWork(store.workMinutes); setCustomBreak(store.breakMinutes); setShowSettings(true) }}>设置</button>
      } />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          {store.mode === 'work' ? '💪 工作中' : '☕ 休息中'}
          {store.status === 'paused' && ' ⏸️ 已暂停'}
        </div>

        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 24 }}>
          <svg width="200" height="200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle cx="100" cy="100" r="88" fill="none"
              stroke={store.mode === 'work' ? 'var(--color-primary)' : 'var(--color-success)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              transform="rotate(-90, 100, 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
              今日完成: {store.completedToday} 个
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {store.status === 'idle' && (
            <button className="btn btn-primary" style={{ width: 120 }} onClick={handleStart}>▶ 开始</button>
          )}
          {store.status === 'running' && (
            <button className="btn btn-ghost" onClick={() => store.setStatus('paused')}>⏸ 暂停</button>
          )}
          {store.status === 'paused' && (
            <button className="btn btn-primary" onClick={() => store.setStatus('running')}>▶ 继续</button>
          )}
          {store.status !== 'idle' && (
            <button className="btn btn-ghost" onClick={() => { store.reset(); if (intervalRef.current) clearInterval(intervalRef.current) }}>⏹ 结束</button>
          )}
        </div>
      </div>

      <Modal open={showSettings} title="番茄钟设置" onClose={() => setShowSettings(false)}>
        <div className="form-group">
          <label className="form-label">工作时长（分钟）</label>
          <input className="form-input" type="number" min={1} max={120} value={customWork}
            onChange={(e) => setCustomWork(parseInt(e.target.value) || 25)} />
        </div>
        <div className="form-group">
          <label className="form-label">休息时长（分钟）</label>
          <input className="form-input" type="number" min={1} max={60} value={customBreak}
            onChange={(e) => setCustomBreak(parseInt(e.target.value) || 5)} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => { store.setWorkMinutes(customWork); store.setBreakMinutes(customBreak); setShowSettings(false) }}>
          保存
        </button>
      </Modal>
    </>
  )
}
