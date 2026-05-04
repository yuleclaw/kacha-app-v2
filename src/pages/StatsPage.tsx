import PageHeader from '../components/PageHeader'
import { useAnniversaryStore } from '../store/useAnniversaryStore'
import { useExpiryStore } from '../store/useExpiryStore'
import { useCouponStore } from '../store/useCouponStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { useScheduleStore } from '../store/useScheduleStore'
import { useExpenseStore } from '../store/useExpenseStore'
import { useWarrantyStore } from '../store/useWarrantyStore'
import { useFlashStore } from '../store/useFlashStore'

interface StatsPageProps {
  onBack: () => void
}

export default function StatsPage({ onBack }: StatsPageProps) {
  const anniversaryItems = useAnniversaryStore((s) => s.items.length)
  const expiryItems = useExpiryStore((s) => s.items)
  const expiredCount = expiryItems.filter((i) => new Date(i.expiryDate) < new Date()).length
  const soonCount = expiryItems.filter((i) => {
    const d = new Date(i.expiryDate)
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
    return diff >= 0 && diff <= 7
  }).length
  const normalCount = expiryItems.length - expiredCount - soonCount

  const couponItems = useCouponStore((s) => s.items)
  const expiredCoupons = couponItems.filter((i) => new Date(i.expiryDate) < new Date()).length
  const validCoupons = couponItems.length - expiredCoupons

  const pomodoroCount = usePomodoroStore((s) => s.completedToday)
  const scheduleCount = useScheduleStore((s) => s.items.length)
  const expenseStats = useExpenseStore((s) => {
    const all = s.items
    return { total: all.reduce((sum, i) => sum + i.amount, 0), count: all.length }
  })
  const warrantyCount = useWarrantyStore((s) => s.items.length)
  const flashCount = useFlashStore((s) => s.items.length)

  return (
    <>
      <PageHeader title="📊 统计" onBack={onBack} />

      <div className="page">
        {/* Pomodoro */}
        <div className="card">
          <div className="card-title mb-sm">🍅 番茄钟</div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="stat-card">
              <div className="stat-value">{pomodoroCount}</div>
              <div className="stat-label">今日完成</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-title mb-sm">📦 物品</div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-success)' }}>{normalCount}</div>
              <div className="stat-label">正常</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{soonCount}</div>
              <div className="stat-label">临期</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{expiredCount}</div>
              <div className="stat-label">已过期</div>
            </div>
          </div>
        </div>

        {/* Coupons */}
        <div className="card">
          <div className="card-title mb-sm">🎫 优惠券</div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-success)' }}>{validCoupons}</div>
              <div className="stat-label">可用</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{expiredCoupons}</div>
              <div className="stat-label">已过期</div>
            </div>
          </div>
        </div>

        {/* More stats */}
        <div className="card">
          <div className="card-title mb-sm">其他</div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="stat-card">
              <div className="stat-value">{scheduleCount}</div>
              <div className="stat-label">日程</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{warrantyCount}</div>
              <div className="stat-label">保修</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{flashCount}</div>
              <div className="stat-label">秒杀</div>
            </div>
          </div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr', marginTop: 8 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-danger)' }}>¥{expenseStats.total.toFixed(0)}</div>
              <div className="stat-label">报销总计（{expenseStats.count}笔）</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title mb-sm">✨ 总览</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            纪念日 {anniversaryItems} 个 · 物品 {expiryItems.length} 个 · 优惠券 {couponItems.length} 张 · 保修 {warrantyCount} 个
          </div>
        </div>
      </div>
    </>
  )
}
