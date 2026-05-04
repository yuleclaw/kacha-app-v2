import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'

interface StopwatchPageProps {
  onBack: () => void
}

export default function StopwatchPage({ onBack }: StopwatchPageProps) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      const start = Date.now() - time
      intervalRef.current = setInterval(() => setTime(Date.now() - start), 50)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const format = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    const hundredths = Math.floor((ms % 1000) / 10)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
  }

  return (
    <>
      <PageHeader title="⏱️ 秒表" onBack={onBack} />
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: 24, fontFamily: 'var(--font-mono)' }}>
          {format(time)}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={() => setIsRunning(true)}>▶ 开始</button>
          ) : (
            <button className="btn btn-ghost" onClick={() => setIsRunning(false)}>⏸ 暂停</button>
          )}
          {isRunning && (
            <button className="btn btn-ghost" onClick={() => setLaps((prev) => [time, ...prev])}>🔴 记圈</button>
          )}
          <button className="btn btn-ghost" onClick={() => { setIsRunning(false); setTime(0); setLaps([]) }}>⏹ 重置</button>
        </div>

        {laps.length > 0 && (
          <div style={{ width: '100%', maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>圈数记录</div>
            {laps.map((lap, i) => (
              <div key={i} className="flex-between" style={{ padding: '4px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ fontSize: 13 }}>圈 {laps.length - i}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{format(lap)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
