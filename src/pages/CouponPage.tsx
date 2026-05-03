import React, { useState, useEffect } from 'react'
import { useCouponStore } from '@/store/useCouponStore'
import { Coupon, PLATFORM_LABELS } from '@/types'
import { daysUntil, formatDate, isExpired } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface CouponPageProps {
  onBack: () => void
}

export default function CouponPage({ onBack }: CouponPageProps) {
  const { items, load, add, update, remove } = useCouponStore()
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Coupon | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [source, setSource] = useState<Coupon['source']>('jd')
  const [discount, setDiscount] = useState('')
  const [condition, setCondition] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [code, setCode] = useState('')
  const [notifyEnabled, setNotifyEnabled] = useState(true)

  useEffect(() => { load() }, [])

  const filtered = items
    .filter(i => {
      if (filter === 'expired') return isExpired(i.expiryDate)
      if (filter === 'available') return !isExpired(i.expiryDate)
      return true
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  const openAdd = () => {
    setEditItem(null); setName(''); setSource('jd'); setDiscount('')
    setCondition(''); setExpiryDate(''); setCode(''); setNotifyEnabled(true); setShowModal(true)
  }

  const openEdit = (item: Coupon) => {
    setEditItem(item); setName(item.name); setSource(item.source); setDiscount(item.discount)
    setCondition(item.condition); setExpiryDate(item.expiryDate); setCode(item.code)
    setNotifyEnabled(item.notifyEnabled); setShowModal(true)
  }

  const handleSave = () => {
    if (!name.trim() || !expiryDate) return
    const data = { name: name.trim(), source, discount, condition, expiryDate, code, category: source, imageUrl: '', notifyEnabled }
    if (editItem) update(editItem.id, data)
    else add(data)
    setShowModal(false)
  }

  const copyCode = async (code: string) => {
    if (!code) return
    try { await navigator.clipboard.writeText(code); alert('兑换码已复制') }
    catch { window.prompt('复制兑换码:', code) }
  }

  return (
    <div className="app-container">
      <PageHeader title="优惠券" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          {[
            { key: 'all', label: '全部' }, { key: 'available', label: '可用' }, { key: 'expired', label: '已过期' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-sm)', fontWeight: 500,
              background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
              color: filter === f.key ? 'white' : 'var(--color-text-secondary)',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎫</div><div className="empty-state-text">暂无优惠券</div></div>
        ) : (
          filtered.map(item => {
            const expired = isExpired(item.expiryDate)
            return (
              <div key={item.id} className="card" onClick={() => openEdit(item)} style={{ cursor: 'pointer', opacity: expired ? 0.6 : 1 }}>
                <div className="flex items-center justify-between mb-sm">
                  <span className="tag tag-primary">{PLATFORM_LABELS[item.source] || item.source}</span>
                  <span style={{ fontSize: 'var(--font-xs)', color: expired ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                    {expired ? '已过期' : `还剩${daysUntil(item.expiryDate)}天`}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }} className="truncate">{item.name}</div>
                <div className="flex items-center gap-sm mt-sm">
                  <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: 'var(--font-lg)' }}>{item.discount}</span>
                  {item.condition && <span className="text-secondary" style={{ fontSize: 'var(--font-xs)' }}>{item.condition}</span>}
                </div>
                <div className="flex items-center justify-between mt-md">
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
                    到期: {formatDate(item.expiryDate)}
                  </span>
                  <div className="flex gap-sm">
                    {item.code && (
                      <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); copyCode(item.code) }}>📋 复制码</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑优惠券' : '添加优惠券'}>
        <div className="form-group">
          <label className="form-label">券名称</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="券名称" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">来源</label>
            <select className="form-select" value={source} onChange={e => setSource(e.target.value as Coupon['source'])}>
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">到期日期</label>
            <input className="form-input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">折扣信息</label>
            <input className="form-input" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="满200减20" />
          </div>
          <div className="form-group">
            <label className="form-label">使用条件</label>
            <input className="form-input" value={condition} onChange={e => setCondition(e.target.value)} placeholder="消费满200元" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">兑换码</label>
          <input className="form-input" value={code} onChange={e => setCode(e.target.value)} placeholder="兑换码（可选）" />
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '添加'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除优惠券" message="确定要删除这个优惠券吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
