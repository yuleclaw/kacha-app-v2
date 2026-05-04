import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useAnniversaryStore, type UpcomingAnniversary } from '../store/useAnniversaryStore'
import { formatDate, getLunarMonthDay, daysLabel } from '../utils/date'
import type { Anniversary } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

interface AnniversaryPageProps {
  onBack: () => void
}

const CATEGORIES = [
  { value: 'birthday', label: '生日' },
  { value: 'love', label: '恋爱' },
  { value: 'work', label: '工作' },
  { value: 'other', label: '其他' },
] as const

export default function AnniversaryPage({ onBack }: AnniversaryPageProps) {
  const store = useAnniversaryStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Anniversary | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ title: '', date: '', category: 'other', lunar: false, repeatYearly: true, notifyBefore: 1, notifyEnabled: true, notifyTimes: [9] })

  const filtered = filter === 'all' ? store.items : store.items.filter((a) => a.category === filter)
  const withDays = filtered.map((a) => {
    const { days } = store.getUpcoming().find((u: UpcomingAnniversary) => u.id === a.id) ?? { days: 0 }
    return { ...a, days }
  })
  withDays.sort((a, b) => a.days - b.days)

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', date: '', category: 'other', lunar: false, repeatYearly: true, notifyBefore: 1, notifyEnabled: true, notifyTimes: [9] })
    setShowAdd(true)
  }

  const openEdit = (item: Anniversary) => {
    setEditing(item)
    setForm({
      title: item.title,
      date: item.date,
      category: item.category,
      lunar: item.lunar,
      repeatYearly: item.repeatYearly,
      notifyBefore: item.notifyBefore,
      notifyEnabled: item.notifyEnabled,
      notifyTimes: item.notifyTimes,
    })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.title || !form.date) return
    const data: Anniversary = {
      id: editing?.id ?? generateId(),
      title: form.title,
      date: form.date,
      category: form.category as Anniversary['category'],
      lunar: form.lunar,
      repeatYearly: form.repeatYearly,
      notifyBefore: form.notifyBefore,
      notifyEnabled: form.notifyEnabled,
      notifyTimes: form.notifyTimes,
    }
    if (editing) {
      store.update(data.id, data)
    } else {
      store.add(data)
    }
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="纪念日" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          <span className={`tag ${filter === 'all' ? 'tag-primary' : ''}`}
            style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>全部</span>
          {CATEGORIES.map((c) => (
            <span key={c.value} className={`tag ${filter === c.value ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer' }} onClick={() => setFilter(c.value)}>{c.label}</span>
          ))}
        </div>

        {withDays.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💜</div>
            <p>暂无纪念日</p>
          </div>
        ) : withDays.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }}
            onClick={() => openEdit(item)}>
            <div className="flex-between">
              <div>
                <div className="card-title">{item.title}</div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatDate(item.date)} {item.lunar ? `(${getLunarMonthDay(item.date)})` : ''}
                </div>
                {item.category && <span className="tag tag-primary" style={{ marginTop: 4 }}>
                  {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
                </span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.days <= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {item.days > 0 ? `${item.days}天` : item.days === 0 ? '今天' : '已过'}
                </div>
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }}
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAdd} title={editing ? '编辑纪念日' : '添加纪念日'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="如：结婚纪念日" />
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">分类</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group flex-between">
          <label className="form-label" style={{ marginBottom: 0 }}>农历</label>
          <input type="checkbox" checked={form.lunar} onChange={(e) => setForm({ ...form, lunar: e.target.checked })} />
        </div>
        <div className="form-group flex-between">
          <label className="form-label" style={{ marginBottom: 0 }}>每年重复</label>
          <input type="checkbox" checked={form.repeatYearly} onChange={(e) => setForm({ ...form, repeatYearly: e.target.checked })} />
        </div>
        <div className="form-group">
          <label className="form-label">提前提醒（天）</label>
          <input className="form-input" type="number" min={0} max={30}
            value={form.notifyBefore} onChange={(e) => setForm({ ...form, notifyBefore: parseInt(e.target.value) || 0 })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="删除纪念日"
        message="确定要删除这个纪念日吗？"
        danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
