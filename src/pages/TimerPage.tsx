import React, { useState, useEffect, useRef } from 'react'
import PageHeader from '@/components/PageHeader'

interface TimerPageProps {
  onBack: () => void
}

export default function TimerPage({ onBack }: TimerPageProps) {
  const [inputMinutes, setInputMinutes] = useState(5)
  const [timeLeft, setTimeLeft] = useState(5 * 60 * 1000)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isRunning) {
      endTimeRef.current = Date.now() + timeLeft
      timerRef.current = setInterval(() => {
        const remaining = endTimeRef.current - Date.now()
        if (remaining <= 0) {
          setIsRunning(false); setTimeLeft(0); setIsFinished(true)
          return
        }
        setTimeLeft(remaining)
      }, 50)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRunning])

  const totalMinutes = Math.floor(timeLeft / 60000)
  const totalSeconds = Math.floor((timeLeft % 60000) / 1000)
  const ms = Math.floor((timeLeft % 1000) / 10)

  const handleStart = () => {
    if (isFinished) { setIsFinished(false) }
    setIsRunning(true)
  }
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false); setIsFinished(false)
    setTimeLeft(inputMinutes * 60 * 1000)
  }

  const setInput = (m: number) => {
    setInputMinutes(m); setTimeLeft(m * 60 * 1000); setIsRunning(false); setIsFinished(false)
  }

  return (
    <div className="app-container">
      <PageHeader title="倒计时" onBack={onBack} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px' }}>
        <div style={{
          fontSize: '64px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          color: isFinished ? 'var(--color-danger)' : 'var(--color-text-primary)',
          margin: 'var(--spacing-xl) 0',
        }}>
          {String(totalMinutes).padStart(2, '0')}:{String(totalSeconds).padStart(2, '0')}<span style={{ fontSize: '36px', opacity: 0.5 }}>.{String(ms).padStart(2, '0')}</span>
        </div>

        {isFinished && (
          <div style={{ fontSize: 'var(--font-lg)', color: 'var(--color-danger)', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            时间到！
          </div>
        )}

        {!isRunning && !isFinished && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            {[1, 3, 5, 10, 15, 30].map(m => (
              <button
                key={m}
                onClick={() => setInput(m)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-sm)',
                  background: inputMinutes === m ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                  color: inputMinutes === m ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                {m}分
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={handleStart}>▶️ 开始</button>
          ) : (
            <button className="btn btn-secondary" onClick={handlePause}>⏸️ 暂停</button>
          )}
          <button className="btn btn-secondary" onClick={handleReset}>⏹️ 重置</button>
        </div>
      </div>
    </div>
  )
}
