import React, { useState, useEffect, useRef } from 'react'
import PageHeader from '@/components/PageHeader'

interface StopwatchPageProps {
  onBack: () => void
}

interface Lap {
  id: number
  time: number
  diff: number
}

export default function StopwatchPage({ onBack }: StopwatchPageProps) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const startTimeRef = useRef<number>(0)
  const animRef = useRef<number>(0)
  const lapIdRef = useRef(0)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed
      const tick = () => {
        setElapsed(Date.now() - startTimeRef.current)
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false); setElapsed(0); setLaps([])
  }

  const handleLap = () => {
    const lapTime = Date.now() - startTimeRef.current
    const prevLap = laps.length > 0 ? laps[0].time : 0
    lapIdRef.current++
    setLaps([{ id: lapIdRef.current, time: lapTime, diff: lapTime - prevLap }, ...laps])
  }

  const formatMs = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centis = Math.floor((ms % 1000) / 10)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
  }

  return (
    <div className="app-container">
      <PageHeader title="秒表" onBack={onBack} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px' }}>
        <div style={{
          fontSize: '56px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          margin: 'var(--spacing-xl) 0',
        }}>
          {formatMs(elapsed)}
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={handleStart}>▶️ 开始</button>
          ) : (
            <button className="btn btn-secondary" onClick={handlePause}>⏸️ 暂停</button>
          )}
          {isRunning ? (
            <button className="btn btn-secondary" onClick={handleLap}>🔄 记圈</button>
          ) : (
            elapsed > 0 && (
              <button className="btn btn-danger" onClick={handleReset}>⏹️ 重置</button>
            )
          )}
        </div>

        {laps.length > 0 && (
          <div style={{ width: '100%', padding: '0 var(--spacing-lg)' }}>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
              圈数记录 ({laps.length})
            </div>
            {laps.map((lap, idx) => (
              <div
                key={lap.id}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '0.5px solid var(--color-border)',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
                  圈 {laps.length - idx}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-md)' }}>
                  +{formatMs(lap.diff)}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-md)' }}>
                  {formatMs(lap.time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
