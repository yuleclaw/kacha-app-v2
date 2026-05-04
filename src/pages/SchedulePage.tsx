import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useScheduleStore } from '../store/useScheduleStore'
import { formatDate, formatTime, isTodayDate } from '../utils/date'
import type { Schedule } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface SchedulePageProps { onBack: () => void }

export default function SchedulePage({ onBack }: SchedulePageProps) {
  const store = useScheduleStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '', location: '', contactName: '', contactPhone: '', notes: '', linkedTransport: '', notifyBefore: 30, notifyEnabled: true })

  const byDate = store.getByDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))
  const allDates = [...new Set(store.items.map((s) => s.startTime.slice(0, 10)))].sort()

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', startTime: `${selectedDate}T09:00`, endTime: `${selectedDate}T10:00`, location: '', contactName: '', contactPhone: '', notes: '', linkedTransport: '', notifyBefore: 30, notifyEnabled: true })
    setShowAdd(true)
  }

  const openEdit = (item: Schedule) => {
    setEditing(item)
    setForm({ title: item.title, startTime: item.startTime, endTime: item.endTime, location: item.location, contactName: item.contactName, contactPhone: item.contactPhone, notes: item.notes, linkedTransport: item.linkedTransport, notifyBefore: item.notifyBefore, notifyEnabled: item.notifyEnabled })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.title || !form.startTime) return
    const data: Schedule = { id: editing?.id ?? generateId(), ...form, notifyBefore: form.notifyBefore }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="📅 日程" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        {/* Date selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {allDates.slice(0, 14).map((d) => (
            <span key={d} className={`tag ${selectedDate === d ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedDate(d)}>
              {d === new Date().toISOString().slice(0, 10) ? '今天' : d.slice(5)}
            </span>
          ))}
        </div>

        <div className="text-sm text-secondary mb-sm">{formatDate(selectedDate)}</div>

        {byDate.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><p>暂无日程</p></div>
        ) : byDate.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
            <div className="flex-between">
              <div>
                <div className="card-title">{item.title}</div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </div>
                {item.location && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>📍 {item.location}</div>}
                {item.contactName && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>👤 {item.contactName}{item.contactPhone ? ` ${item.contactPhone}` : ''}</div>}
              </div>
              <button className="btn btn-sm btn-ghost"
                onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑日程' : '添加日程'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">开始</label>
            <input className="form-input" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">结束</label>
            <input className="form-input" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">地点</label>
          <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">联系人</label>
            <input className="form-input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">电话</label>
            <input className="form-input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除日程" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
