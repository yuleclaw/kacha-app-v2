import type { PageName, UniversalAddType } from '../types'

interface AddPanelProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: PageName) => void
  onScan: () => void
}

interface AddItem {
  label: string
  icon: string
  action: () => void
}

export default function AddPanel({ open, onClose, onNavigate, onScan }: AddPanelProps) {
  if (!open) return null

  const items: AddItem[] = [
    { label: '拍照识别', icon: '📷', action: onScan },
    { label: '纪念日', icon: '💜', action: () => { onNavigate('anniversary'); onClose() } },
    { label: '保质期', icon: '📦', action: () => { onNavigate('expiry'); onClose() } },
    { label: '保修期', icon: '🔧', action: () => { onNavigate('warranty'); onClose() } },
    { label: '优惠券', icon: '🎫', action: () => { onNavigate('coupon'); onClose() } },
    { label: '秒杀', icon: '⚡', action: () => { onNavigate('flash'); onClose() } },
    { label: '日程', icon: '📅', action: () => { onNavigate('schedule'); onClose() } },
    { label: '旅行', icon: '✈️', action: () => { onNavigate('travel'); onClose() } },
    { label: '报销', icon: '💰', action: () => { onNavigate('expense'); onClose() } },
  ]

  return (
    <>
      <div className="add-panel-overlay" onClick={onClose} />
      <div className="add-panel">
        <div className="add-panel-grid">
          {items.map((item) => (
            <button key={item.label} className="add-panel-item" onClick={item.action}>
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
