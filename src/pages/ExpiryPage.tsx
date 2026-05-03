import React, { useState, useEffect } from 'react'
import { useExpiryStore } from '@/store/useExpiryStore'
import { ExpiryItem } from '@/types'
import { daysUntil, formatDate, isExpired, isExpiringSoon } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import Toggle from '@/components/Toggle'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ExpiryPageProps {
  onBack: () => void
}

const TYPE_LABELS: Record<string, string> = { food: '食品', cosmetic: '化妆品', medicine: '药品', other: '其他' }

export default function ExpiryPage({ onBack }: ExpiryPageProps) {
  const { items, load, add, update, remove, toggleNotify } = useExpiryStore()
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ExpiryItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<ExpiryItem['type']>('food')
  const [expiryDate, setExpiryDate] = useState('')
  const [productionDate, setProductionDate] = useState('')
  const [shelfLife, setShelfLife] = useState('')
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(7)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => { load() }, [])

  const filtered = items
    .filter(i => {
      if (filter === 'expired') return isExpired(i.expiryDate)
      if (filter === 'expiring') return isExpiringSoon(i.expiryDate, 7) && !isExpired(i.expiryDate)
      if (filter === 'normal') return !isExpired(i.expiryDate) && !isExpiringSoon(i.expiryDate, 7)
      if (filter !== 'all' && filter !== 'expired' && filter !== 'expiring' && filter !== 'normal')
        return i.type === filter
      return true
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  const openAdd = () => {
    setEditItem(null); setName(''); setType('food'); setExpiryDate('')
    setProductionDate(''); setShelfLife(''); setNotifyDaysBefore(7)
    setNotifyEnabled(true); setImageUrl(''); setShowModal(true)
  }

  const openEdit = (item: ExpiryItem) => {
    setEditItem(item); setName(item.name); setType(item.type); setExpiryDate(item.expiryDate)
    setProductionDate(item.productionDate); setShelfLife(String(item.shelfLife))
    setNotifyDaysBefore(item.notifyDaysBefore); setNotifyEnabled(item.notifyEnabled)
    setImageUrl(item.imageUrl); setShowModal(true)
  }

  const handleSave = () => {
    if (!name.trim() || !expiryDate) return
    const data = { name: name.trim(), type, expiryDate, productionDate, shelfLife: Number(shelfLife) || 0, notifyDaysBefore, notifyEnabled, imageUrl, category: type }
    if (editItem) update(editItem.id, data)
    else add(data)
    setShowModal(false)
  }

  const getStatusColor = (item: ExpiryItem) => {
    if (isExpired(item.expiryDate)) return 'var(--color-danger)'
    if (isExpiringSoon(item.expiryDate, 7)) return 'var(--color-warning)'
    return 'var(--color-success)'
  }

  const getStatusTag = (item: ExpiryItem) => {
    if (isExpired(item.expiryDate)) return <span className="tag tag-danger">已过期</span>
    if (isExpiringSoon(item.expiryDate, 7)) return <span className="tag tag-warning">临期</span>
    return <span className="tag tag-success">正常</span>
  }

  return (
    <div className="app-container">
      <PageHeader title="保质期管理" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)', overflowX: 'auto' }}>
          {[
            { key: 'all', label: '全部' }, { key: 'expired', label: '已过期' },
            { key: 'expiring', label: '临期' }, { key: 'normal', label: '正常' },
            { key: 'food', label: '食品' }, { key: 'cosmetic', label: '化妆品' }, { key: 'medicine', label: '药品' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-sm)', fontWeight: 500,
              background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
              color: filter === f.key ? 'white' : 'var(--color-text-secondary)', whiteSpace: 'nowrap',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-text">暂无物品</div></div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="list-item" onClick={() => openEdit(item)} style={{ cursor: 'pointer' }}>
              <div className="list-item-icon" style={{ background: getStatusColor(item) + '18', fontSize: '18px' }}>
                {item.type === 'food' ? '🍽️' : item.type === 'cosmetic' ? '💄' : item.type === 'medicine' ? '💊' : '📦'}
              </div>
              <div className="list-item-content">
                <div className="flex items-center gap-sm">
                  <span className="list-item-title">{item.name}</span>
                  {getStatusTag(item)}
                </div>
                <div className="list-item-subtitle">
                  {TYPE_LABELS[item.type]} | 到期: {formatDate(item.expiryDate)} | {daysUntil(item.expiryDate) > 0 ? `还剩${daysUntil(item.expiryDate)}天` : '已过期'}
                </div>
              </div>
              <button className="header-btn" onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑物品' : '添加物品'}>
        <div className="form-group">
          <label className="form-label">物品名称</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="物品名称" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">类型</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as ExpiryItem['type'])}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">到期日期</label>
            <input className="form-input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">生产日期</label>
            <input className="form-input" type="date" value={productionDate} onChange={e => setProductionDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">保质期（天）</label>
            <input className="form-input" type="number" value={shelfLife} onChange={e => setShelfLife(e.target.value)} placeholder="如 365" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">提前提醒</label>
            <select className="form-select" value={notifyDaysBefore} onChange={e => setNotifyDaysBefore(Number(e.target.value))}>
              {[1, 3, 7, 14, 30].map(d => <option key={d} value={d}>{d}天</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
            <div className="flex items-center gap-sm"><Toggle active={notifyEnabled} onChange={setNotifyEnabled} /><span style={{ fontSize: 'var(--font-sm)' }}>提醒</span></div>
          </div>
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '添加'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除物品" message="确定要删除这个物品吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
