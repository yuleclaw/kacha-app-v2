import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import Toggle from '../components/Toggle'
import { useExpiryStore } from '../store/useExpiryStore'
import { formatDate, daysFromToday, daysLabel } from '../utils/date'
import { CATEGORY_LABELS } from '../types'
import type { ExpiryItem } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface ExpiryPageProps { onBack: () => void }

const TYPES = ['food', 'cosmetic', 'medicine', 'other'] as const

export default function ExpiryPage({ onBack }: ExpiryPageProps) {
  const store = useExpiryStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<ExpiryItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', type: 'food' as string, expiryDate: '', productionDate: '', shelfLife: 0, notifyDaysBefore: 7, notifyEnabled: true, imageUrl: '', category: '' })

  const filtered = filter === 'all' ? store.items
    : filter === 'expired' ? store.getExpired()
    : filter === 'soon' ? store.getExpiringSoon()
    : store.items.filter((i) => i.type === filter)

  const sorted = [...filtered].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', type: 'food', expiryDate: '', productionDate: '', shelfLife: 0, notifyDaysBefore: 7, notifyEnabled: true, imageUrl: '', category: '' })
    setShowAdd(true)
  }

  const openEdit = (item: ExpiryItem) => {
    setEditing(item)
    setForm({ name: item.name, type: item.type, expiryDate: item.expiryDate, productionDate: item.productionDate, shelfLife: item.shelfLife, notifyDaysBefore: item.notifyDaysBefore, notifyEnabled: item.notifyEnabled, imageUrl: item.imageUrl, category: item.category })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.name || !form.expiryDate) return
    const data: ExpiryItem = { id: editing?.id ?? generateId(), ...form, type: form.type as ExpiryItem['type'] }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="📦 保质期" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {['all', 'expired', 'soon', ...TYPES].map((t) => (
            <span key={t} className={`tag ${filter === t ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFilter(t)}>
              {t === 'all' ? '全部' : t === 'expired' ? '已过期' : t === 'soon' ? '临期' : CATEGORY_LABELS[t] ?? t}
            </span>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">📦</div><p>暂无记录</p></div>
        ) : sorted.map((item) => {
          const days = daysFromToday(item.expiryDate)
          return (
            <div key={item.id} className="card" style={{ cursor: 'pointer', borderLeft: days < 0 ? '3px solid var(--color-danger)' : days <= 7 ? '3px solid var(--color-warning)' : '3px solid transparent' }}
              onClick={() => openEdit(item)}>
              <div className="flex-between">
                <div>
                  <div className="card-title">{item.name}</div>
                  <div className="card-subtitle" style={{ marginTop: 2 }}>
                    <span className="tag tag-primary" style={{ marginRight: 4 }}>{CATEGORY_LABELS[item.type] ?? item.type}</span>
                    {formatDate(item.expiryDate)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: days < 0 ? 'var(--color-danger)' : days <= 7 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                    {daysLabel(days)}
                  </div>
                  <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }}
                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
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
            {TYPES.map((t) => <option key={t} value={t}>{CATEGORY_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">过期日期</label>
          <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">生产日期</label>
          <input className="form-input" type="date" value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">提前提醒（天）</label>
          <input className="form-input" type="number" min={0} value={form.notifyDaysBefore}
            onChange={(e) => setForm({ ...form, notifyDaysBefore: parseInt(e.target.value) || 0 })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除物品" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
