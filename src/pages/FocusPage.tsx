import type { PageName } from '../types'

interface FocusPageProps {
  onNavigate: (page: PageName) => void
}

export default function FocusPage({ onNavigate }: FocusPageProps) {
  const items = [
    { key: 'pomodoro' as PageName, label: '番茄钟', icon: '🍅', desc: '25分钟专注工作' },
    { key: 'timer' as PageName, label: '倒计时', icon: '⏲️', desc: '自定义时长' },
    { key: 'stopwatch' as PageName, label: '秒表', icon: '⏱️', desc: '毫秒精度' },
    { key: 'flash' as PageName, label: '秒杀', icon: '⚡', desc: '抢购提醒' },
  ]

  return (
    <>
      <div className="page-header">
        <h1>⏱️ 专注</h1>
      </div>
      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
          {items.map((item) => (
            <div key={item.key} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '24px 12px' }}
              onClick={() => onNavigate(item.key)}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
