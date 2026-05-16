import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useExpiryStore } from '../store/useExpiryStore'
import { formatDate, daysFromToday, daysLabel } from '../utils/date'
import { ITEM_CATEGORY_LABELS } from '../types'
import type { ExpiryItem, ItemCategory } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
interface ExpiryPageProps { onBack: () => void }

export default function ExpiryPage({ onBack }: ExpiryPageProps) {
  const store = useExpiryStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<ExpiryItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', type: 'shelfLife' as string, expiryDate: '', category: 'food' as string, brand: '', purchaseDate: '', notifyDaysBefore: 7, notifyEnabled: true, extendedWarranty: 0, extendedWarrantyCost: 0, notes: '', imageUrl: '' })

  const CATEGORIES = Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))

  const filtered = filter === 'all' ? store.items
    : filter === 'expired' ? store.getExpired()
    : filter === 'soon' ? store.getExpiringSoon()
    : store.items.filter((i) => i.category === filter)

  const sorted = [...filtered].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', type: 'shelfLife', expiryDate: '', category: 'food', brand: '', purchaseDate: '', notifyDaysBefore: 7, notifyEnabled: true, extendedWarranty: 0, extendedWarrantyCost: 0, notes: '', imageUrl: '' })
    setShowAdd(true)
  }

  const openEdit = (item: ExpiryItem) => {
    setEditing(item)
    setForm({ name: item.name, type: item.type, expiryDate: item.expiryDate, category: item.category, brand: item.brand || '', purchaseDate: item.purchaseDate || '', notifyDaysBefore: item.notifyDaysBefore, notifyEnabled: item.notifyEnabled, extendedWarranty: item.extendedWarranty || 0, extendedWarrantyCost: item.extendedWarrantyCost || 0, notes: item.notes || '', imageUrl: item.imageUrl || '' })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.name || !form.expiryDate) return
    const data: ExpiryItem = {
      id: editing?.id ?? genId(),
      name: form.name,
      type: form.type as 'shelfLife' | 'warranty',
      expiryDate: form.expiryDate,
      category: form.category as ItemCategory,
      brand: form.brand || undefined,
      purchaseDate: form.purchaseDate || undefined,
      notifyDaysBefore: form.notifyDaysBefore,
      notifyEnabled: form.notifyEnabled,
      extendedWarranty: form.extendedWarranty || undefined,
      extendedWarrantyCost: form.extendedWarrantyCost || undefined,
      notes: form.notes || undefined,
      imageUrl: form.imageUrl || undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="物品管理" onBack={onBack} right={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          <span className={`tag ${filter === 'all' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>全部</span>
          <span className={`tag ${filter === 'expired' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('expired')}>已过期</span>
          <span className={`tag ${filter === 'soon' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('soon')}>临期</span>
          {CATEGORIES.map((c) => (
            <span key={c.value} className={`tag ${filter === c.value ? 'tag-primary' : ''}`} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setFilter(c.value)}>{c.label}</span>
          ))}
        </div>
        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">📦</div><p>暂无物品</p></div>
        ) : sorted.map((item) => {
          const days = daysFromToday(item.expiryDate)
          return (
            <div key={item.id} className="card" style={{ cursor: 'pointer', borderLeft: days < 0 ? '3px solid var(--color-danger)' : days <= 7 ? '3px solid var(--color-warning)' : '3px solid transparent' }} onClick={() => openEdit(item)}>
              <div className="flex-between">
                <div>
                  <div className="card-title">{item.name}</div>
                  <div className="card-subtitle" style={{ marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span className="tag tag-primary">{ITEM_CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className={`tag ${item.type === 'warranty' ? 'tag-warning' : 'tag-success'}`}>{item.type === 'warranty' ? '保修' : '保质期'}</span>
                    {item.brand && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{item.brand}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{formatDate(item.expiryDate)}</div>
                  {item.extendedWarranty ? <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>延保 {item.extendedWarranty}月</div> : null}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: days < 0 ? 'var(--color-danger)' : days <= 7 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>{daysLabel(days)}</div>
                  <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Modal open={showAdd} title={editing ? '编辑物品' : '添加物品'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">名称</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="shelfLife">保质期</option>
            <option value="warranty">保修期</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">分类</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">到期/保修日</label>
            <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">品牌</label>
            <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
        </div>
        {form.type === 'warranty' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">购买日期</label>
              <input className="form-input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">延保(月)</label>
              <input className="form-input" type="number" min={0} value={form.extendedWarranty} onChange={(e) => setForm({ ...form, extendedWarranty: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">提前提醒（天）</label>
          <input className="form-input" type="number" min={0} value={form.notifyDaysBefore} onChange={(e) => setForm({ ...form, notifyDaysBefore: parseInt(e.target.value) || 0 })} />
        </div>
        {form.notes !== undefined && (
          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editing ? '保存' : '添加'}</button>
      </Modal>
      <ConfirmDialog open={deleteId !== null} title="删除" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
