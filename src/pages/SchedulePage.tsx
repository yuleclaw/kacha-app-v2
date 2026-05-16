import { useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useScheduleStore } from '../store/useScheduleStore'
import { formatDate, formatTime } from '../utils/date'
import type { Schedule } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
interface SchedulePageProps { onBack: () => void }

export default function SchedulePage({ onBack }: SchedulePageProps) {
  const store = useScheduleStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return now.getFullYear() * 100 + (now.getMonth() + 1)
  })
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '', location: '', contactName: '', contactPhone: '', notes: '', linkedTransport: '', notifyBefore: 30, notifyEnabled: true })

  const byDate = store.getByDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Calendar calculation
  const calendar = useMemo(() => {
    const year = Math.floor(calendarMonth / 100)
    const month = calendarMonth % 100
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startWeekday = firstDay.getDay() // 0=Sun
    const weeks: (number | null)[][] = []
    let week: (number | null)[] = []
    for (let i = 0; i < startWeekday; i++) week.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }
    return { year, month, weeks, daysInMonth }
  }, [calendarMonth])

  // Check if date has any schedules
  const hasSchedule = (day: number) => {
    const ds = `${calendar.year}-${String(calendar.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return store.items.some((s) => s.startTime.startsWith(ds))
  }

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
    const data: Schedule = { id: editing?.id ?? genId(), ...form, notifyBefore: form.notifyBefore, createdAt: editing?.createdAt ?? Date.now() }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  const handlePaste = () => {
    const result = store.parsePastedText(pasteText)
    if (result) {
      setForm({ ...form, ...result })
      setShowPaste(false)
      setPasteText('')
      setShowAdd(true)
    }
  }

  const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <>
      <PageHeader title="日程" onBack={onBack} right={
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowPaste(true)}>粘贴</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>
        </div>
      } />
      <div className="page">
        {/* Calendar Month View */}
        <div className="card" style={{ padding: '12px' }}>
          {/* Month header */}
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setCalendarMonth(calendar.month === 1 ? (calendar.year - 1) * 100 + 12 : calendarMonth - 1)}>‹</button>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{calendar.year}年{calendar.month}月</div>
            <button className="btn btn-sm btn-ghost" onClick={() => setCalendarMonth(calendar.month === 12 ? (calendar.year + 1) * 100 + 1 : calendarMonth + 1)}>›</button>
          </div>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
            {WEEKDAY_LABELS.map((l) => <div key={l}>{l}</div>)}
          </div>
          {/* Days grid */}
          {calendar.weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', fontSize: 13 }}>
              {week.map((day, di) => {
                if (!day) return <div key={di} />
                const dateStr = `${calendar.year}-${String(calendar.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === new Date().toISOString().slice(0, 10)
                const has = hasSchedule(day)
                return (
                  <div key={di} style={{
                    padding: '6px 0', cursor: 'pointer', borderRadius: 6,
                    background: isSelected ? 'var(--color-primary)' : isToday ? 'var(--color-primary-light)' : 'transparent',
                    color: isSelected ? 'white' : isToday ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    position: 'relative',
                  }} onClick={() => setSelectedDate(dateStr)}>
                    {day}
                    {has && <div style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isSelected ? 'white' : 'var(--color-primary)',
                      margin: '2px auto 0',
                    }} />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Schedule list */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, marginTop: 4 }}>
          <span className="text-sm text-secondary">{formatDate(selectedDate)}</span>
          <span className="text-sm text-secondary">({byDate.length}项)</span>
        </div>

        {byDate.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><p>暂无日程</p></div>
        ) : byDate.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
            <div className="flex-between">
              <div>
                <div className="card-title">{item.title}</div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>{formatTime(item.startTime)} - {formatTime(item.endTime)}</div>
                {item.location && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>📍 {item.location}</div>}
                {item.contactName && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>👤 {item.contactName} {item.contactPhone || ''}</div>}
                {item.linkedTransport && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>🚄 {item.linkedTransport}</div>}
              </div>
              <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑日程' : '添加日程'} onClose={() => setShowAdd(false)}>
        <div className="form-group"><label className="form-label">标题</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">开始</label><input className="form-input" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">结束</label><input className="form-input" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">地点</label><input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">联系人</label><input className="form-input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">电话</label><input className="form-input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">关联交通</label><input className="form-input" value={form.linkedTransport} onChange={(e) => setForm({ ...form, linkedTransport: e.target.value })} placeholder="G1234 北京南→上海虹桥" /></div>
        <div className="form-group"><label className="form-label">备注</label><textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editing ? '保存' : '添加'}</button>
      </Modal>

      <Modal open={showPaste} title="粘贴识别" onClose={() => setShowPaste(false)}>
        <div className="form-group"><label className="form-label">粘贴日程文本</label>
          <textarea className="form-textarea" rows={5} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="第一行为标题&#10;可包含时间和地点信息" /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePaste} disabled={!pasteText.trim()}>解析并填入</button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}