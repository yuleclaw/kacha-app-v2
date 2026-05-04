import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useExpiryStore } from '@/store/useExpiryStore'
import { useCouponStore } from '@/store/useCouponStore'
import { useScheduleStore } from '@/store/useScheduleStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import PageHeader from '@/components/PageHeader'

const COLORS = ['#7F77DD', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#00C7BE']

export default function StatsPage({ onBack }: { onBack: () => void }) {
  const { getTodayCount, getWeekCount, getMonthCount } = usePomodoroStore()
  const { getExpired, getExpiringSoon, getNormal } = useExpiryStore()
  const { getAvailable, getExpiringSoon: getCouponExpiring } = useCouponStore()
  const { getToday, getUpcoming } = useScheduleStore()
  const { getStats } = useExpenseStore()

  const [refresh, setRefresh] = useState(0)

  useEffect(() => { setRefresh(1) }, [])

  const pomodoroToday = getTodayCount()
  const pomodoroWeek = getWeekCount()
  const pomodoroMonth = getMonthCount()
  const expiredItems = getExpired()
  const expiringItems = getExpiringSoon(7)
  const normalItems = getNormal().length
  const couponsAvailable = getAvailable()
  const couponsExpiring = getCouponExpiring(3)
  const todaySchedules = getToday()
  const upcomingSchedules = getUpcoming(7)
  const expenseStats = getStats()

  const expiryPie = [
    { name: '过期', value: expiredItems.length },
    { name: '临期', value: expiringItems.length },
    { name: '正常', value: normalItems },
  ].filter(d => d.value > 0)

  const couponPie = [
    { name: '可用', value: couponsAvailable.length },
    { name: '临期', value: couponsExpiring.length },
  ].filter(d => d.value > 0)

  return (
    <div className="app-container">
      <PageHeader title="统计" onBack={onBack} />
      <div className="page" style={{ paddingBottom: 'var(--spacing-2xl)' }}>

        {/* Pomodoro Stats */}
        <div className="section-title"><span className="section-title-text">?? 番茄钟</span></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          {[
            { label: '今日', value: pomodoroToday, color: '#FF3B30' },
            { label: '本周', value: pomodoroWeek, color: '#FF9500' },
            { label: '本月', value: pomodoroMonth, color: '#34C759' },
          ].map(s => (
            <div key={s.label} className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
              <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Items Expiry Stats */}
        <div className="section-title"><span className="section-title-text">?? 物品保质期</span></div>
        {expiryPie.length > 0 && (
          <div style={{ padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={expiryPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                  {expiryPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-danger)' }}>{expiredItems.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>已过期</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-warning)' }}>{expiringItems.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>临期7天</div>
          </div>
        </div>

        {/* Coupon Stats */}
        <div className="section-title"><span className="section-title-text">?? 优惠券</span></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-coupon)' }}>{couponsAvailable.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>可用</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-warning)' }}>{couponsExpiring.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>临期3天</div>
          </div>
        </div>

        {/* Schedule Stats */}
        <div className="section-title"><span className="section-title-text">?? 日程</span></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{todaySchedules.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>今日</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{upcomingSchedules.length}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>近7日</div>
          </div>
        </div>

        {/* Expense Stats */}
        <div className="section-title"><span className="section-title-text">?? 报销统计</span></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg)' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>￥{expenseStats.total.toFixed(0)}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>总计</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-warning)' }}>￥{expenseStats.pending.toFixed(0)}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>待报销</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--spacing-md)', marginBottom: 0 }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-success)' }}>￥{expenseStats.approved.toFixed(0)}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>已报销</div>
          </div>
        </div>

      </div>
    </div>
  )
}