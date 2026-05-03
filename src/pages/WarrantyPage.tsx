import React, { useState, useEffect } from 'react'
import { useWarrantyStore } from '@/store/useWarrantyStore'
import { WarrantyItem } from '@/types'
import { daysUntil, formatDate, isExpired, isExpiringSoon } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import Toggle from '@/components/Toggle'
import ConfirmDialog from '@/components/ConfirmDialog'

interface WarrantyPageProps {
  onBack: () => void
}

const TYPE_LABELS: Record<string, string> = { electronics: '电子产品', appliance: '家电', other: '其他' }

export default function WarrantyPage({ onBack }: WarrantyPageProps) {
  const { items, load, add, update, remove, toggleNotify } = useWarrantyStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<WarrantyItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<WarrantyItem['type']>('electronics')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState('')
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(30)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => { load() }, [])

  const sorted = [...items].sort((a, b) => new Date(a.warrantyExpiry).getTime() - new Date(b.warrantyExpiry).getTime())

  const openAdd = () => {
    setEditItem(null); setName(''); setType('electronics'); setPurchaseDate('')
    setWarrantyExpiry(''); setNotifyDaysBefore(30); setNotifyEnabled(true)
    setNotes(''); setImageUrl(''); setShowModal(true)
  }

  const openEdit = (item: WarrantyItem) => {
    setEditItem(item); setName(item.name); setType(item.type); setPurchaseDate(item.purchaseDate)
    setWarrantyExpiry(item.warrantyExpiry); setNotifyDaysBefore(item.notifyDaysBefore)
    setNotifyEnabled(item.notifyEnabled); setNotes(item.notes); setImageUrl(item.imageUrl); setShowModal(true)
  }

  const handleSave = () => {
    if (!name.trim() || !warrantyExpiry) return
    const data = { name: name.trim(), type, purchaseDate, warrantyExpiry, notifyDaysBefore, notifyEnabled, notes, imageUrl }
    if (editItem) update(editItem.id, data)
    else add(data)
    setShowModal(false)
  }

  const getStatus = (item: WarrantyItem) => {
    if (isExpired(item.warrantyExpiry)) return { color: 'var(--color-danger)', label: '已过期', tagClass: 'tag-danger' }
    if (isExpiringSoon(item.warrantyExpiry, 30)) return { color: 'var(--color-warning)', label: '即将到期', tagClass: 'tag-warning' }
    return { color: 'var(--color-success)', label: '保修中', tagClass: 'tag-success' }
  }

  return (
    <div className="app-container">
      <PageHeader title="保修期管理" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        {sorted.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔧</div><div className="empty-state-text">暂无保修记录</div></div>
        ) : (
          sorted.map(item => {
            const status = getStatus(item)
            return (
              <div key={item.id} className="list-item" onClick={() => openEdit(item)} style={{ cursor: 'pointer' }}>
                <div className="list-item-icon" style={{ background: status.color + '18', fontSize: '18px' }}>
                  {item.type === 'electronics' ? '📱' : item.type === 'appliance' ? '🏠' : '🔧'}
                </div>
                <div className="list-item-content">
                  <div className="flex items-center gap-sm">
                    <span className="list-item-title">{item.name}</span>
                    <span className={`tag ${status.tagClass}`}>{status.label}</span>
                  </div>
                  <div className="list-item-subtitle">
                    {TYPE_LABELS[item.type]} | 到期: {formatDate(item.warrantyExpiry)} | {daysUntil(item.warrantyExpiry) > 0 ? `还剩${daysUntil(item.warrantyExpiry)}天` : '已过期'}
                  </div>
                </div>
                <button className="header-btn" onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑保修' : '添加保修'}>
        <div className="form-group">
          <label className="form-label">产品名称</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="产品名称" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">类型</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as WarrantyItem['type'])}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">购买日期</label>
            <input className="form-input" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">保修到期</label>
            <input className="form-input" type="date" value={warrantyExpiry} onChange={e => setWarrantyExpiry(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">提前提醒</label>
            <select className="form-select" value={notifyDaysBefore} onChange={e => setNotifyDaysBefore(Number(e.target.value))}>
              {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d}天</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="备注信息" rows={2} />
        </div>
        <div className="flex items-center gap-sm" style={{ padding: 'var(--spacing-sm) 0' }}>
          <Toggle active={notifyEnabled} onChange={setNotifyEnabled} />
          <span style={{ fontSize: 'var(--font-sm)' }}>开启提醒</span>
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '添加'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除保修记录" message="确定要删除吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
