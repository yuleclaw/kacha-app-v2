import { useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { useAnniversaryStore } from '../store/useAnniversaryStore'
import { useExpiryStore } from '../store/useExpiryStore'
import { useCouponStore } from '../store/useCouponStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { useScheduleStore } from '../store/useScheduleStore'
import { useExpenseStore } from '../store/useExpenseStore'
import { useFlashStore } from '../store/useFlashStore'
import { EXPENSE_CATEGORY_LABELS, ITEM_CATEGORY_LABELS } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#4A90D9', '#1D9E75', '#EF9F27', '#E24B4A', '#534AB7', '#993556']

interface StatsPageProps { onBack: () => void }

export default function StatsPage({ onBack }: StatsPageProps) {
  const anniversaryCount = useAnniversaryStore((s) => s.items.length)
  const expiryCount = useExpiryStore((s) => s.items.length)
  const couponCount = useCouponStore((s) => s.items.length)
  const pomodoroCount = usePomodoroStore((s) => s.completedToday)
  const scheduleCount = useScheduleStore((s) => s.items.length)
  const flashCount = useFlashStore((s) => s.items.length)
  const expenseStats = useExpenseStore((s) => {
    const all = s.items
    return {
      total: all.reduce((sum, i) => sum + i.amount, 0),
      count: all.length,
      transportKm: all.filter(i => i.category === 'transport').reduce((s, i) => s + (i.km || 0), 0),
    }
  })

  const expenseItems = useExpenseStore((s) => s.items)

  const expiry = useExpiryStore((s) => s.items)
  const expired = expiry.filter((i) => new Date(i.expiryDate) < new Date()).length
  const soon = expiry.filter((i) => { const d = new Date(i.expiryDate); const diff = Math.ceil((d.getTime() - Date.now()) / 86400000); return diff >= 0 && diff <= 7 }).length
  const normal = expiry.length - expired - soon

  const coupons = useCouponStore((s) => s.items)
  const expiredCoupons = coupons.filter((i) => new Date(i.expiryDate) < new Date()).length
  const validCoupons = coupons.length - expiredCoupons

  const pieData = useMemo(() => {
    const cats = [...new Set(expenseItems.map(i => i.category))]
    return cats.map((cat, i) => ({
      name: EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] || cat,
      value: expenseItems.filter(i => i.category === cat).reduce((s, i) => s + i.amount, 0),
      fill: COLORS[i % COLORS.length],
    }))
  }, [expenseItems])

  return (
    <>
      <PageHeader title="统计" onBack={onBack} />
      <div className="page">
        <div className="card">
          <div className="card-title mb-sm">番茄钟</div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="stat-card"><div className="stat-value">{pomodoroCount}</div><div className="stat-label">今日完成</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-sm">物品</div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{normal}</div><div className="stat-label">正常</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{soon}</div><div className="stat-label">临期</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>{expired}</div><div className="stat-label">已过期</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-sm">优惠券</div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{validCoupons}</div><div className="stat-label">可用</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>{expiredCoupons}</div><div className="stat-label">已过期</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-sm">其他</div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-value">{scheduleCount}</div><div className="stat-label">日程</div></div>
            <div className="stat-card"><div className="stat-value">{flashCount}</div><div className="stat-label">秒杀</div></div>
            <div className="stat-card"><div className="stat-value">{expiryCount}</div><div className="stat-label">物品</div></div>
          </div>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr', marginTop: 8 }}>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>¥{expenseStats.total.toFixed(0)}</div><div className="stat-label">报销总计 ({expenseStats.count}笔)</div></div>
          </div>
          {expenseStats.transportKm > 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 4 }}>
              自驾里程: {expenseStats.transportKm}km
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="card">
          <div className="card-title mb-sm">物品状态分布</div>
          <div style={{ width: '100%', height: 160 }}>
            <BarChart width={500} height={160} data={[
              { name: '正常', count: normal },
              { name: '临期', count: soon },
              { name: '过期', count: expired },
            ]}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#4A90D9" radius={[4,4,0,0]} />
            </BarChart>
          </div>
        </div>

        {expenseStats.count > 0 && (
          <div className="card">
            <div className="card-title mb-sm">报销分类</div>
            <div style={{ width: '100%', height: 200 }}>
              <PieChart width={500} height={200}>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name} fontSize={11}>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        )}

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title mb-sm">总览</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            纪念日 {anniversaryCount} · 物品 {expiryCount} · 优惠券 {couponCount} · 秒杀 {flashCount}
          </div>
        </div>
      </div>
    </>
  )
}
