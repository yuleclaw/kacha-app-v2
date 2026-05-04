import React, { useEffect } from 'react'
import { useAnniversaryStore } from '@/store/useAnniversaryStore'
import { useFlashStore } from '@/store/useFlashStore'
import { useExpiryStore } from '@/store/useExpiryStore'
import { useCouponStore } from '@/store/useCouponStore'
import { useScheduleStore } from '@/store/useScheduleStore'
import { formatCountdown, formatCountdownDetailed, formatFlashCountdown, formatTime } from '@/utils/date'
import { formatLunar } from '@/utils/lunar'
import { PLATFORM_LABELS, Anniversary, FlashSale, ExpiryItem, Coupon, Schedule } from '@/types'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { load: loadAnn, items: annItems } = useAnniversaryStore()
  const { load: loadFlash, items: flashItems } = useFlashStore()
  const { load: loadExpiry, getExpired, getExpiringSoon } = useExpiryStore()
  const { load: loadCoupon, getExpiringSoon: getCouponExpiring } = useCouponStore()
  const { load: loadSchedule, getToday } = useScheduleStore()

  useEffect(() => {
    loadAnn(); loadFlash(); loadExpiry(); loadCoupon(); loadSchedule()
  }, [])

  const upcomingAnn: Anniversary[] = useAnniversaryStore(s => s.getUpcoming(3))
  const upcomingFlash: FlashSale[] = useFlashStore(s => s.getUpcoming())
  const expiredItems = getExpired()
  const expiringItems = getExpiringSoon(7)
  const expiringCoupons = getCouponExpiring(3)
  const todaySchedules = getToday()

  // Build attention list based on priority
  const attentionList: { id: string; icon: string; text: string; color: string; page: string }[] = []
  upcomingFlash.forEach((f: FlashSale) => attentionList.push({
    id: f.id, icon: '?', text: `${f.productName} 即将开抢`, color: 'var(--color-flash)', page: 'flash'
  }))
  expiringCoupons.forEach((c: Coupon) => attentionList.push({
    id: c.id, icon: '??', text: `${c.name} 即将过期`, color: 'var(--color-coupon)', page: 'coupon'
  }))
  expiredItems.forEach((i: ExpiryItem) => attentionList.push({
    id: i.id, icon: '??', text: `${i.name} 已过期`, color: 'var(--color-danger)', page: 'expiry'
  }))
  expiringItems.forEach((i: ExpiryItem) => attentionList.push({
    id: i.id, icon: '??', text: `${i.name} 即将过期`, color: 'var(--color-expiry)', page: 'expiry'
  }))
  upcomingAnn.forEach((a: Anniversary) => attentionList.push({
    id: a.id, icon: '??', text: `${a.title} 还有${a.days}天`, color: 'var(--color-anniversary)', page: 'anniversary'
  }))

  return (
    <div className="page">
      {/* Hero - Anniversary Countdown */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        marginBottom: 'var(--spacing-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '14px' }}>??</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-sm)' }}>纪念日倒计时</span>
        </div>
        {upcomingAnn.length > 0 ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', overflowX: 'auto', paddingBottom: '4px' }}>
            {upcomingAnn.map((a: Anniversary) => (
              <div
                key={a.id}
                onClick={() => onNavigate('anniversary')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  minWidth: '140px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: 'white', fontSize: 'var(--font-3xl)', fontWeight: 700 }}>
                  {a.days > 0 ? a.days : 0}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-sm)' }}>天</div>
                <div style={{ color: 'white', fontSize: 'var(--font-md)', marginTop: 'var(--spacing-sm)', fontWeight: 500 }} className="truncate">
                  {a.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-xs)', marginTop: '2px' }}>
                  {formatLunar(a.date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-sm)' }}>
          暂无纪念日，点击添加
        </div>
      )}
      </div>

      {/* Flash Sale Reminder */}
      {upcomingFlash.length > 0 && (
        <div className="section-title">
          <span className="section-title-text">? 秒杀提醒</span>
          <span className="section-title-more" onClick={() => onNavigate('flash')}>查看全部</span>
        </div>
      )}
      {upcomingFlash.slice(0, 2).map((f: FlashSale) => {
        const countdown = formatFlashCountdown(f.startTime)
        return (
          <div
            key={f.id}
            className="card"
            style={{ marginBottom: 'var(--spacing-md)', cursor: 'pointer' }}
            onClick={() => onNavigate('flash')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{f.productName}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  {PLATFORM_LABELS[f.platform] || f.platform}
                </div>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-sm)', marginRight: '8px' }}>
                    ￥{f.originalPrice}
                  </span>
                  <span className="text-danger" style={{ fontWeight: 600 }}>
                    ￥{f.salePrice}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                {countdown.days > 0 && (
                  <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-danger)' }}>
                    {countdown.days}天
                  </div>
                )}
                <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--color-danger)' }}>
                  {countdown.hours}时{countdown.minutes}分
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Attention List */}
      {attentionList.length > 0 && (
        <>
          <div className="section-title">
            <span className="section-title-text">?? 需关注</span>
          </div>
          {attentionList.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="list-item"
              onClick={() => onNavigate(item.page)}
              style={{ cursor: 'pointer' }}
            >
              <div className="list-item-icon" style={{ background: item.color + '18', fontSize: '18px' }}>
                {item.icon}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{item.text}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* Today's Schedule */}
      {todaySchedules.length > 0 && (
        <>
          <div className="section-title">
            <span className="section-title-text">?? 今日日程</span>
            <span className="section-title-more" onClick={() => onNavigate('schedule')}>查看全部</span>
          </div>
          {todaySchedules.map((s: Schedule) => (
            <div
              key={s.id}
              className="list-item"
              onClick={() => onNavigate('schedule')}
              style={{ cursor: 'pointer' }}
            >
              <div className="list-item-icon" style={{ background: 'var(--color-schedule)18', color: 'var(--color-schedule)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                {formatTime(s.startTime)}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{s.title}</div>
                {s.location && <div className="list-item-subtitle">?? {s.location}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Quick Shortcuts */}
      <div className="section-title">
        <span className="section-title-text">快捷入口</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
        <div
          onClick={() => onNavigate('scan')}
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto var(--spacing-sm)', fontSize: '22px'
          }}>??</div>
          <span style={{ fontSize: 'var(--font-sm)' }}>扫描</span>
        </div>
        <div
          onClick={() => onNavigate('stats')}
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto var(--spacing-sm)', fontSize: '22px'
          }}>??</div>
          <span style={{ fontSize: 'var(--font-sm)' }}>统计</span>
        </div>
        <div
          onClick={() => onNavigate('settings')}
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto var(--spacing-sm)', fontSize: '22px'
          }}>??</div>
          <span style={{ fontSize: 'var(--font-sm)' }}>设置</span>
        </div>
      </div>

      {/* Empty state when nothing */}
      {attentionList.length === 0 && todaySchedules.length === 0 && upcomingFlash.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">??</div>
          <div className="empty-state-text">一切正常，没有需要关注的事项</div>
        </div>
      )}
    </div>
  )
}