import React from 'react'
import PageHeader from '@/components/PageHeader'

interface ItemsPageProps {
  onNavigate: (page: string) => void
}

const ITEMS_ENTRIES = [
  { key: 'expiry', icon: '📦', label: '保质期', desc: '食品/化妆品/药品', color: '#FF9500', bgColor: '#FFF3E0' },
  { key: 'warranty', icon: '🔧', label: '保修期', desc: '电子产品/家电', color: '#007AFF', bgColor: '#E5F1FF' },
  { key: 'coupon', icon: '🎫', label: '优惠券', desc: '折扣/代金券管理', color: '#5856D6', bgColor: '#EEEDFE' },
  { key: 'expense', icon: '💰', label: '报销', desc: '报销记录管理', color: '#FF9500', bgColor: '#FFF3E0' },
]

export default function ItemsPage({ onNavigate }: ItemsPageProps) {
  return (
    <div className="app-container">
      <PageHeader title="物品" />
      <div className="page">
        <div style={{ padding: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          {ITEMS_ENTRIES.map(item => (
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
