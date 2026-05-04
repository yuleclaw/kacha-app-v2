import type { PageName } from '../types'

interface ItemsPageProps {
  onNavigate: (page: PageName) => void
}

export default function ItemsPage({ onNavigate }: ItemsPageProps) {
  const items = [
    { key: 'expiry' as PageName, label: '保质期', icon: '📦', desc: '食品/化妆品/药品' },
    { key: 'warranty' as PageName, label: '保修期', icon: '🔧', desc: '电子产品/家电' },
    { key: 'coupon' as PageName, label: '优惠券', icon: '🎫', desc: '券码管理' },
    { key: 'expense' as PageName, label: '报销', icon: '💰', desc: '费用记录' },
  ]

  return (
    <>
      <div className="page-header">
        <h1>📦 物品</h1>
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
