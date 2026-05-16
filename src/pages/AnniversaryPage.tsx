import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useAnniversaryStore, type UpcomingAnniversary } from '../store/useAnniversaryStore'
import { formatDate, getLunarMonthDay } from '../utils/date'
import type { Anniversary } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface AnniversaryPageProps { onBack: () => void }

const CATEGORIES = [
  { value: 'birthday', label: '生日' },
  { value: 'love', label: '恋爱' },
  { value: 'work', label: '工作' },
  { value: 'other', label: '其他' },
] as const

const REPEAT_TYPES = [
  { value: 'yearly', label: '每年' },
  { value: 'monthly', label: '每月' },
  { value: 'weekly', label: '每周' },
  { value: 'custom', label: '自定义' },
] as const

export default function AnniversaryPage({ onBack }: AnniversaryPageProps) {
  const store = useAnniversaryStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Anniversary | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({
    title: '', date: '', category: 'other' as string, lunar: false,
    repeatType: 'yearly' as string, repeatInterval: 0,
    notifyBefore: 1, notifyEnabled: true, notifyTimes: [9], imageUrl: '',
  })

  const filtered = filter === 'all' ? store.items : store.items.filter((a) => a.category === filter)
  const withDays = filtered.map((a) => {
    const u = store.getUpcoming().find((u: UpcomingAnniversary) => u.id === a.id)
    return { ...a, days: u?.days ?? 0 }
  }).sort((a, b) => a.days - b.days)

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', date: '', category: 'other', lunar: false, repeatType: 'yearly', repeatInterval: 0, notifyBefore: 1, notifyEnabled: true, notifyTimes: [9], imageUrl: '' })
    setShowAdd(true)
  }

  const openEdit = (item: Anniversary) => {
    setEditing(item)
    setForm({ title: item.title, date: item.date, category: item.category, lunar: item.lunar, repeatType: item.repeatType, repeatInterval: item.repeatInterval || 0, notifyBefore: item.notifyBefore, notifyEnabled: item.notifyEnabled, notifyTimes: item.notifyTimes, imageUrl: item.imageUrl || '' })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.title || !form.date) return
    const data: Anniversary = {
      id: editing?.id ?? genId(),
      title: form.title,
      date: form.date,
      category: form.category as Anniversary['category'],
      lunar: form.lunar,
      repeatType: form.repeatType as Anniversary['repeatType'],
      repeatInterval: form.repeatType === 'custom' ? form.repeatInterval : undefined,
      notifyBefore: form.notifyBefore,
      notifyEnabled: form.notifyEnabled,
      notifyTimes: form.notifyTimes,
      imageUrl: form.imageUrl || undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => setForm({ ...form, imageUrl: ev.target?.result as string || '' })
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <>
      <PageHeader title="纪念日" onBack={onBack} right={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          <span className={`tag ${filter === 'all' ? 'tag-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>全部</span>
          {CATEGORIES.map((c) => (
            <span key={c.value} className={`tag ${filter === c.value ? 'tag-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(c.value)}>{c.label}</span>
          ))}
        </div>
        {withDays.length === 0 ? (
          <div className="empty-state"><div className="icon">💜</div><p>暂无纪念日</p></div>
        ) : withDays.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
            <div className="flex-between">
              <div>
                <div className="card-title">{item.title}</div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatDate(item.date)} {item.lunar ? `(${getLunarMonthDay(item.date)})` : ''}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <span className="tag tag-primary">{CATEGORIES.find(c => c.value === item.category)?.label}</span>
                  <span className="tag tag-warning">{REPEAT_TYPES.find(r => r.value === item.repeatType)?.label || '每年'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.days <= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {item.days > 0 ? `${item.days}天` : item.days === 0 ? '今天' : '已过'}
                </div>
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
              </div>
            </div>
            {item.imageUrl && (
              <img src={item.imageUrl} alt="cover" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} />
            )}
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑纪念日' : '添加纪念日'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
        <div className="form-group">
          <label className="form-label">重复方式</label>
          <select className="form-select" value={form.repeatType} onChange={(e) => setForm({ ...form, repeatType: e.target.value })}>
            {REPEAT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        {form.repeatType === 'custom' && (
          <div className="form-group">
            <label className="form-label">间隔天数</label>
            <input className="form-input" type="number" min={1} value={form.repeatInterval} onChange={(e) => setForm({ ...form, repeatInterval: parseInt(e.target.value) || 1 })} />
          </div>
        )}
        <div className="form-group flex-between">
          <label className="form-label">农历</label>
          <input type="checkbox" checked={form.lunar} onChange={(e) => setForm({ ...form, lunar: e.target.checked })} />
        </div>
        <div className="form-group">
          <label className="form-label">提前提醒（天）</label>
          <input className="form-input" type="number" min={0} max={30} value={form.notifyBefore} onChange={(e) => setForm({ ...form, notifyBefore: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">封面图片</label>
          <button className="btn btn-sm btn-ghost" onClick={handleImageUpload}>{form.imageUrl ? '已选择' : '选择图片'}</button>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave}>{editing ? '保存' : '添加'}</button>
      </Modal>
      <ConfirmDialog open={deleteId !== null} title="删除纪念日" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
