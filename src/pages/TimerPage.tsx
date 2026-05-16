import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

interface TimerPageProps { onBack: () => void }

export default function TimerPage({ onBack }: TimerPageProps) {
  const [totalMs, setTotalMs] = useState(0)
  const [msLeft, setMsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showSet, setShowSet] = useState(false)
  const [inputMinutes, setInputMinutes] = useState(5)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(0)

  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current
        const remaining = Math.max(0, totalMs - elapsed)
        setMsLeft(remaining)
        if (remaining <= 0) { setIsRunning(false); setMsLeft(0) }
      }, 50) // 50ms for smooth centisecond display
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, totalMs])

  const totalSec = Math.floor(msLeft / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const cs = Math.floor((msLeft % 1000) / 10) // centiseconds
  const progress = totalMs > 0 ? (totalMs - msLeft) / totalMs * 100 : 0

  return (
    <>
      <PageHeader title="倒计时" onBack={onBack} />
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
        <svg width="200" height="200" style={{ marginBottom: 24 }}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="100" cy="100" r="88" fill="none"
            stroke="var(--color-warning)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            transform="rotate(-90, 100, 100)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
        </svg>
        <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        {msLeft > 0 && msLeft < 10000 && (
          <div style={{ fontSize: 20, color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            .{String(cs).padStart(2, '0')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {!isRunning && msLeft <= 0 && <button className="btn btn-primary" onClick={() => setShowSet(true)}>设置时长</button>}
          {!isRunning && msLeft > 0 && <button className="btn btn-primary" onClick={() => setIsRunning(true)}>▶ 开始</button>}
          {isRunning && <button className="btn btn-ghost" onClick={() => setIsRunning(false)}>⏸ 暂停</button>}
          {msLeft > 0 && <button className="btn btn-ghost" onClick={() => { setIsRunning(false); setMsLeft(totalMs) }}>⏹ 重置</button>}
        </div>
      </div>
      <Modal open={showSet} title="设置时长" onClose={() => setShowSet(false)}>
        <div className="form-group"><label className="form-label">分钟</label>
          <input className="form-input" type="number" min={1} max={999} value={inputMinutes} onChange={(e) => setInputMinutes(parseInt(e.target.value) || 1)} /></div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {[1, 3, 5, 10, 15, 30].map((m) => (
            <span key={m} className="tag tag-primary" style={{ cursor: 'pointer' }}
              onClick={() => { setInputMinutes(m) }}>{m}分钟</span>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => { const ms = inputMinutes * 60000; setTotalMs(ms); setMsLeft(ms); setShowSet(false) }}>确定</button>
      </Modal>
    </>
  )
}
