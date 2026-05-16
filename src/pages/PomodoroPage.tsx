import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import WhiteNoise, { playCompleteSound } from '../components/WhiteNoise'
import { usePomodoroStore } from '../store/usePomodoroStore'

interface PomodoroPageProps { onBack: () => void }

const WHITE_NOISE_TYPES = [
  { key: 'rain' as const, label: '雨声', icon: '🌧️' },
  { key: 'ocean' as const, label: '海浪', icon: '🌊' },
  { key: 'forest' as const, label: '森林', icon: '🌲' },
  { key: 'cafe' as const, label: '咖啡厅', icon: '☕' },
]

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
          if (s.mode === 'work') {
            store.setMode('break')
            store.setSecondsLeft(store.breakMinutes * 60)
            store.incrementCompleted()
            playCompleteSound()
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

  return (
    <>
      <PageHeader title="番茄钟" onBack={onBack} right={
        <button className="btn btn-sm btn-ghost" onClick={() => { setCustomWork(store.workMinutes); setCustomBreak(store.breakMinutes); setShowSettings(true) }}>设置</button>
      } />

      <WhiteNoise type={store.whiteNoiseType} enabled={store.whiteNoiseEnabled} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          {store.mode === 'work' ? '工作中' : '休息中'}
          {store.status === 'paused' && ' (已暂停)'}
        </div>

        <svg width="200" height="200" style={{ marginBottom: 16 }}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="100" cy="100" r="88" fill="none"
            stroke={store.mode === 'work' ? 'var(--color-primary)' : 'var(--color-success)'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            transform="rotate(-90, 100, 100)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ fontSize: 40, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: -24 }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          今日完成: {store.completedToday} 个
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {store.status === 'idle' && <button className="btn btn-primary" onClick={() => store.setStatus('running')}>▶ 开始</button>}
          {store.status === 'running' && <button className="btn btn-ghost" onClick={() => store.setStatus('paused')}>⏸ 暂停</button>}
          {store.status === 'paused' && <button className="btn btn-primary" onClick={() => store.setStatus('running')}>▶ 继续</button>}
          {store.status !== 'idle' && <button className="btn btn-ghost" onClick={() => { store.reset(); if (intervalRef.current) clearInterval(intervalRef.current) }}>⏹ 结束</button>}
        </div>

        {/* White noise selector */}
        <div style={{ marginTop: 20, width: '100%' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, textAlign: 'center' }}>🎵 白噪声</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {WHITE_NOISE_TYPES.map((w) => (
              <span key={w.key}
                className={`tag ${store.whiteNoiseType === w.key ? 'tag-primary' : ''}`}
                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}
                onClick={() => store.setWhiteNoise(store.whiteNoiseType === w.key ? 'none' : w.key)}
              >
                {w.icon} {w.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showSettings} title="番茄钟设置" onClose={() => setShowSettings(false)}>
        <div className="form-group"><label className="form-label">工作时长(分钟)</label>
          <input className="form-input" type="number" min={1} max={120} value={customWork} onChange={(e) => setCustomWork(parseInt(e.target.value) || 25)} /></div>
        <div className="form-group"><label className="form-label">休息时长(分钟)</label>
          <input className="form-input" type="number" min={1} max={60} value={customBreak} onChange={(e) => setCustomBreak(parseInt(e.target.value) || 5)} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { store.setWorkMinutes(customWork); store.setBreakMinutes(customBreak); setShowSettings(false) }}>保存</button>
      </Modal>
    </>
  )
}
