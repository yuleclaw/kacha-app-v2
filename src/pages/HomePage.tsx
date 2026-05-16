import { useState, useEffect } from 'react'
import type { PageName } from '../types'
import { useAnniversaryStore } from '../store/useAnniversaryStore'
import { useFlashStore } from '../store/useFlashStore'
import { useExpiryStore } from '../store/useExpiryStore'
import { useCouponStore } from '../store/useCouponStore'
import { useScheduleStore } from '../store/useScheduleStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { daysFromToday, getCountdownText } from '../utils/date'

interface HomePageProps {
  onNavigate: (page: PageName) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const upcoming = useAnniversaryStore((s) => s.getUpcoming(3))
  const flashItems = useFlashStore((s) => s.items)
  const expiryItems = useExpiryStore((s) => s.items)
  const couponItems = useCouponStore((s) => s.items)
  const scheduleItems = useScheduleStore((s) => s.items)
  const pomodoroCompleted = usePomodoroStore((s) => s.completedToday)
  const [heroMode, setHeroMode] = useState<'anniversary' | 'pomodoro'>('anniversary')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const todaySchedules = scheduleItems.filter((s) =>
    s.startTime.startsWith(new Date().toISOString().slice(0, 10)),
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const expiringExpiry = expiryItems.filter((i) => {
    const d = daysFromToday(i.expiryDate)
    return d >= 0 && d <= 7
  }).length

  const expiredCoupons = couponItems.filter((i) => daysFromToday(i.expiryDate) < 0).length
  const expiringWarranty = expiryItems.filter((i) => {
    const d = daysFromToday(i.expiryDate)
    return d >= 0 && d <= 30 && i.type === 'warranty'
  }).length

  const rules: { label: string; count: number; color: string; type: PageName }[] = [
    { label: '即将秒杀', count: flashItems.filter((f) => getCountdownText(f.startTime) !== '已开始' && daysFromToday(f.startTime.split(' ')[0] ?? '') >= -1).length, color: 'var(--color-danger)', type: 'flash' },
    { label: '过期优惠券', count: expiredCoupons, color: 'var(--color-warning)', type: 'coupon' },
    { label: '临期物品', count: expiringExpiry, color: 'var(--color-warning)', type: 'expiry' },
    { label: '临保定保', count: expiringWarranty, color: 'var(--color-primary)', type: 'expiry' },
    { label: '即将纪念日', count: upcoming.length, color: 'var(--color-danger)', type: 'anniversary' },
    { label: '今日日程', count: todaySchedules.length, color: 'var(--color-success)', type: 'schedule' },
  ]

  return (
    <div className="page" style={{ paddingTop: 'var(--safe-top)' }}>
      {/* Hero Section - Anniversary / Pomodoro toggle */}
      <div className="card" style={{ background: heroMode === 'anniversary' ? 'linear-gradient(135deg, #E8F0FE, #FCEBEB)' : 'linear-gradient(135deg, #E1F5EE, #E8F0FE)', border: 'none', marginTop: 8 }}>
        <div className="flex-between" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {heroMode === 'anniversary' ? '💜 纪念日' : '🍅 番茄钟'}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <span className={`tag ${heroMode === 'anniversary' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => setHeroMode('anniversary')}>纪念日</span>
            <span className={`tag ${heroMode === 'pomodoro' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => setHeroMode('pomodoro')}>番茄钟</span>
          </div>
        </div>
        {heroMode === 'anniversary' ? (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)', width: '100%', textAlign: 'center', padding: '12px 0' }}>
              还没有纪念日，点击➕添加
            </div>
          ) : upcoming.map((a) => (
            <div key={a.id} className="card" style={{ minWidth: 140, flexShrink: 0, marginBottom: 0, cursor: 'pointer' }}
              onClick={() => onNavigate('anniversary')}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-danger)' }}>
                {a.days > 0 ? `${a.days}天` : a.days === 0 ? '今天' : '已过'}
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{a.nextDate}</div>
            </div>
          ))}
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-success)' }}>{pomodoroCompleted}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>今日完成番茄钟数</div>
            <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={() => onNavigate('pomodoro')}>去专注</button>
          </div>
        )}
      </div>

      {/* Flash Sales */}
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('flash')}>
        <div className="card-header">
          <span className="card-title">⚡ 秒杀提醒</span>
          {flashItems.length > 0 && <span className="tag tag-danger">{flashItems.length}</span>}
        </div>
        {flashItems.length === 0 ? (
          <div className="text-sm text-secondary">暂无秒杀活动</div>
        ) : (
          flashItems.slice(0, 3).map((f) => (
            <div key={f.id} className="flex-between" style={{ padding: '4px 0' }}>
              <span style={{ fontSize: 13 }}>{f.productName}</span>
              <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{getCountdownText(f.startTime)}</span>
            </div>
          ))
        )}
      </div>

      {/* Attention Rules */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔔 需关注</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {rules.filter(r => r.count > 0).map((r) => (
            <span key={r.type} className="tag" style={{ background: r.color + '20', color: r.color, cursor: 'pointer' }}
              onClick={() => onNavigate(r.type)}>
              {r.label} {r.count}
            </span>
          ))}
          {rules.every(r => r.count === 0) && (
            <span className="text-sm text-secondary">一切正常 🎉</span>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('schedule')}>
        <div className="card-header">
          <span className="card-title">📅 今日日程</span>
          {todaySchedules.length > 0 && <span className="tag tag-success">{todaySchedules.length}</span>}
        </div>
        {todaySchedules.length === 0 ? (
          <div className="text-sm text-secondary">今天没有日程安排</div>
        ) : (
          todaySchedules.slice(0, 5).map((s) => (
            <div key={s.id} className="flex-between" style={{ padding: '4px 0' }}>
              <span style={{ fontSize: 13 }}>{s.title}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                {s.startTime.slice(11, 16)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick Entry */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => onNavigate('scan')}>
          📸 扫描
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => onNavigate('stats')}>
          📊 统计
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => onNavigate('settings')}>
          ⚙️ 设置
        </div>
      </div>
    </div>
  )
}
