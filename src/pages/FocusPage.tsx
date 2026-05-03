import React from 'react'
import PageHeader from '@/components/PageHeader'

interface FocusPageProps {
  onNavigate: (page: string) => void
}

const FOCUS_ITEMS = [
  { key: 'pomodoro', icon: '🍅', label: '番茄钟', desc: '25分钟专注工作', color: '#FF3B30', bgColor: '#FFEBEA' },
  { key: 'timer', icon: '⏱️', label: '倒计时器', desc: '自定义时长倒计时', color: '#007AFF', bgColor: '#E5F1FF' },
  { key: 'stopwatch', icon: '⏱️', label: '秒表', desc: '精确计时+记圈', color: '#34C759', bgColor: '#E8F8ED' },
  { key: 'flash', icon: '⚡', label: '秒杀管理', desc: '管理秒杀活动+提醒', color: '#FF9500', bgColor: '#FFF3E0' },
]

export default function FocusPage({ onNavigate }: FocusPageProps) {
  return (
    <div className="app-container">
      <PageHeader title="聚焦" />
      <div className="page">
        <div style={{ padding: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          {FOCUS_ITEMS.map(item => (
            <div
              key={item.key}
              className="card"
              onClick={() => onNavigate(item.key)}
              style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--spacing-xl)' }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                background: item.bgColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto var(--spacing-md)', fontSize: '26px',
              }}>
                {item.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-md)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
