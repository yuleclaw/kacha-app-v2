import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import Toggle from '../components/Toggle'
import { useCouponStore } from '../store/useCouponStore'
import { formatDate, daysFromToday, daysLabel } from '../utils/date'
import { PLATFORM_LABELS } from '../types'
import type { Coupon } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface CouponPageProps { onBack: () => void }

const SOURCES = ['jd', 'taobao', 'meituan', 'starbucks', 'other'] as const

export default function CouponPage({ onBack }: CouponPageProps) {
  const store = useCouponStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', source: 'jd' as string, discount: '', condition: '', expiryDate: '', code: '', category: '', imageUrl: '', notifyEnabled: true })
  const [copied, setCopied] = useState('')

  const filtered = filter === 'all' ? store.items
    : filter === 'expired' ? store.getExpired()
    : filter === 'soon' ? store.getExpiringSoon()
    : store.items.filter((i) => i.source === filter)

  const sorted = [...filtered].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', source: 'jd', discount: '', condition: '', expiryDate: '', code: '', category: '', imageUrl: '', notifyEnabled: true })
    setShowAdd(true)
  }

  const openEdit = (item: Coupon) => {
    setEditing(item)
    setForm({ name: item.name, source: item.source, discount: item.discount, condition: item.condition, expiryDate: item.expiryDate, code: item.code, category: item.category, imageUrl: item.imageUrl, notifyEnabled: item.notifyEnabled })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.name || !form.expiryDate) return
    const data: Coupon = { id: editing?.id ?? generateId(), ...form, source: form.source as Coupon['source'] }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <>
      <PageHeader title="🎫 优惠券" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {['all', 'expired', 'soon', ...SOURCES].map((t) => (
            <span key={t} className={`tag ${filter === t ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer' }} onClick={() => setFilter(t)}>
              {t === 'all' ? '全部' : t === 'expired' ? '已过期' : t === 'soon' ? '临期' : PLATFORM_LABELS[t] ?? t}
            </span>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">🎫</div><p>暂无优惠券</p></div>
        ) : sorted.map((item) => {
          const days = daysFromToday(item.expiryDate)
          return (
            <div key={item.id} className="card" style={{ borderLeft: days < 0 ? '3px solid var(--color-danger)' : days <= 7 ? '3px solid var(--color-warning)' : '3px solid transparent' }}>
              <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
                <div>
                  <div className="card-title">{item.name}</div>
                  <div className="card-subtitle" style={{ marginTop: 2 }}>
                    <span className="tag tag-primary" style={{ marginRight: 4 }}>{PLATFORM_LABELS[item.source] ?? item.source}</span>
                    {item.discount && <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{item.discount}</span>}
                  </div>
                  {item.condition && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{item.condition}</div>}
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    到期: {formatDate(item.expiryDate)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: days < 0 ? 'var(--color-danger)' : days <= 7 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                    {daysLabel(days)}
                  </div>
                  <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }}
                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
                </div>
              </div>
              {item.code && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '4px 8px', borderRadius: 4 }}>{item.code}</code>
                  <button className="btn btn-sm btn-primary" onClick={() => copyCode(item.code)}>
                    {copied === item.code ? '已复制' : '复制'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={showAdd} title={editing ? '编辑优惠券' : '添加优惠券'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">券名</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">来源</label>
          <select className="form-select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {SOURCES.map((s) => <option key={s} value={s}>{PLATFORM_LABELS[s]}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">折扣</label>
            <input className="form-input" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="满200减20" />
          </div>
          <div className="form-group">
            <label className="form-label">有效期</label>
            <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">使用条件</label>
          <input className="form-input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">兑换码</label>
          <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除优惠券" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
