import React, { useState, useEffect, useRef } from 'react'
import PageHeader from '@/components/PageHeader'

interface PomodoroPageProps {
  onBack: () => void
}

import { useSettingsStore } from '@/store/useSettingsStore'
import { usePomodoroStore } from '@/store/usePomodoroStore'

export default function PomodoroPage({ onBack }: PomodoroPageProps) {
  const { settings, load: loadSettings } = useSettingsStore()
  const { load: loadPomodoro, getTodayCount } = usePomodoroStore()

  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadSettings()
    loadPomodoro()
    const todayCount = getTodayCount()
    if (todayCount > 0) setCompletedCount(todayCount)
  }, [])

  useEffect(() => {
    if (settings.pomodoroWork !== workDuration) {
      setWorkDuration(settings.pomodoroWork)
      if (!isRunning && !isBreak) setTimeLeft(settings.pomodoroWork * 60)
    }
    if (settings.pomodoroBreak !== breakDuration) {
      setBreakDuration(settings.pomodoroBreak)
    }
  }, [settings])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            if (!isBreak) {
              setCompletedCount(c => c + 1)
              setIsBreak(true)
              return breakDuration * 60
            } else {
              setIsBreak(false)
              return workDuration * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRunning, isBreak, workDuration, breakDuration])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isBreak
    ? (breakDuration * 60 - timeLeft) / (breakDuration * 60)
    : (workDuration * 60 - timeLeft) / (workDuration * 60)

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false); setIsBreak(false); setTimeLeft(workDuration * 60)
  }

  const selectDuration = (d: number) => {
    setWorkDuration(d); setTimeLeft(d * 60); setIsRunning(false); setIsBreak(false)
  }

  return (
    <div className="app-container">
      <PageHeader title="番茄钟" onBack={onBack} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
        <div style={{ fontSize: 'var(--font-xl)', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: isBreak ? 'var(--color-success)' : 'var(--color-primary)' }}>
          {isBreak ? '休息时间' : '专注时间'}
        </div>

        <div style={{
          width: '220px', height: '220px', borderRadius: '50%',
          border: `4px solid ${isBreak ? 'var(--color-success)' : 'var(--color-primary)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', margin: 'var(--spacing-xl) 0',
        }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="110" cy="110" r="106" fill="none" stroke={isBreak ? 'var(--color-success-bg)' : 'var(--color-primary-bg)'} strokeWidth="4" />
            <circle
              cx="110" cy="110" r="106" fill="none"
              stroke={isBreak ? 'var(--color-success)' : 'var(--color-primary)'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 106}`}
              strokeDashoffset={`${2 * Math.PI * 106 * (1 - progress)}`}
            />
          </svg>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '48px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              {completedCount} 个番茄已完成
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={handleStart}>▶️ 开始</button>
          ) : (
            <button className="btn btn-secondary" onClick={handlePause}>⏸️ 暂停</button>
          )}
          <button className="btn btn-secondary" onClick={handleReset}>⏹️ 重置</button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)' }}>
          {[15, 25, 30, 45, 60].map(d => (
            <button
              key={d}
              onClick={() => selectDuration(d)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-sm)',
                background: workDuration === d ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                color: workDuration === d ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {d}分
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
