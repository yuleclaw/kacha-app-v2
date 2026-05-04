import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

interface TimerPageProps {
  onBack: () => void
}

export default function TimerPage({ onBack }: TimerPageProps) {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showSet, setShowSet] = useState(false)
  const [inputMinutes, setInputMinutes] = useState(5)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) { setIsRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds * 100 : 0

  return (
    <>
      <PageHeader title="⏲️ 倒计时" onBack={onBack} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
        <svg width="200" height="200" style={{ marginBottom: 24 }}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="100" cy="100" r="88" fill="none"
            stroke="var(--color-warning)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            transform="rotate(-90, 100, 100)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>

        <div style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!isRunning && secondsLeft === 0 && (
            <button className="btn btn-primary" onClick={() => setShowSet(true)}>⏱ 设置时长</button>
          )}
          {!isRunning && secondsLeft > 0 && (
            <button className="btn btn-primary" onClick={() => setIsRunning(true)}>▶ 开始</button>
          )}
          {isRunning && (
            <button className="btn btn-ghost" onClick={() => setIsRunning(false)}>⏸ 暂停</button>
          )}
          {secondsLeft > 0 && (
            <button className="btn btn-ghost" onClick={() => { setIsRunning(false); setSecondsLeft(totalSeconds) }}>⏹ 重置</button>
          )}
        </div>
      </div>

      <Modal open={showSet} title="设置时长" onClose={() => setShowSet(false)}>
        <div className="form-group">
          <label className="form-label">分钟</label>
          <input className="form-input" type="number" min={1} max={999} value={inputMinutes}
            onChange={(e) => setInputMinutes(parseInt(e.target.value) || 1)} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => { const secs = inputMinutes * 60; setTotalSeconds(secs); setSecondsLeft(secs); setShowSet(false) }}>
          确定
        </button>
      </Modal>
    </>
  )
}
