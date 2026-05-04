import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useWarrantyStore } from '../store/useWarrantyStore'
import { formatDate, daysFromToday, daysLabel } from '../utils/date'
import { CATEGORY_LABELS } from '../types'
import type { WarrantyItem } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface WarrantyPageProps { onBack: () => void }

const TYPES = ['electronics', 'appliance', 'other'] as const

export default function WarrantyPage({ onBack }: WarrantyPageProps) {
  const store = useWarrantyStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<WarrantyItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', type: 'electronics' as string, purchaseDate: '', warrantyExpiry: '', notifyDaysBefore: 30, notifyEnabled: true, imageUrl: '', notes: '' })

  const filtered = filter === 'all' ? store.items
    : filter === 'expired' ? store.getExpired()
    : filter === 'soon' ? store.getExpiringSoon()
    : store.items.filter((i) => i.type === filter)

  const sorted = [...filtered].sort((a, b) => a.warrantyExpiry.localeCompare(b.warrantyExpiry))

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', type: 'electronics', purchaseDate: '', warrantyExpiry: '', notifyDaysBefore: 30, notifyEnabled: true, imageUrl: '', notes: '' })
    setShowAdd(true)
  }

  const openEdit = (item: WarrantyItem) => {
    setEditing(item)
    setForm({ name: item.name, type: item.type, purchaseDate: item.purchaseDate, warrantyExpiry: item.warrantyExpiry, notifyDaysBefore: item.notifyDaysBefore, notifyEnabled: item.notifyEnabled, imageUrl: item.imageUrl, notes: item.notes })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.name || !form.warrantyExpiry) return
    const data: WarrantyItem = { id: editing?.id ?? generateId(), ...form, type: form.type as WarrantyItem['type'] }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="🔧 保修期" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {['all', 'expired', 'soon', ...TYPES].map((t) => (
            <span key={t} className={`tag ${filter === t ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer' }} onClick={() => setFilter(t)}>
              {t === 'all' ? '全部' : t === 'expired' ? '已过保' : t === 'soon' ? '即将到期' : CATEGORY_LABELS[t] ?? t}
            </span>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">🔧</div><p>暂无记录</p></div>
        ) : sorted.map((item) => {
          const days = daysFromToday(item.warrantyExpiry)
          return (
            <div key={item.id} className="card" style={{ cursor: 'pointer', borderLeft: days < 0 ? '3px solid var(--color-danger)' : days <= 30 ? '3px solid var(--color-warning)' : '3px solid transparent' }}
              onClick={() => openEdit(item)}>
              <div className="flex-between">
                <div>
                  <div className="card-title">{item.name}</div>
                  <div className="card-subtitle" style={{ marginTop: 2 }}>
                    <span className="tag tag-primary">{CATEGORY_LABELS[item.type] ?? item.type}</span>
                    <span style={{ marginLeft: 6 }}>购买: {formatDate(item.purchaseDate)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: days < 0 ? 'var(--color-danger)' : days <= 30 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
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

      <Modal open={showAdd} title={editing ? '编辑保修' : '添加保修'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">产品名称</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{CATEGORY_LABELS[t]}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">购买日期</label>
            <input className="form-input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">保修到期</label>
            <input className="form-input" type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">提前提醒（天）</label>
          <input className="form-input" type="number" min={0} value={form.notifyDaysBefore}
            onChange={(e) => setForm({ ...form, notifyDaysBefore: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除保修" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
