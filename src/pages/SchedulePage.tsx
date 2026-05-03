import React, { useState, useEffect } from 'react'
import { useScheduleStore } from '@/store/useScheduleStore'
import { Schedule } from '@/types'
import { formatTime, formatDate, generateId, isToday } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface SchedulePageProps {
  onBack: () => void
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function SchedulePage({ onBack }: SchedulePageProps) {
  const { items, load, add, update, remove, toggleNotify, getByDate } = useScheduleStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Schedule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [notifyBefore, setNotifyBefore] = useState(15)
  const [notifyEnabled, setNotifyEnabled] = useState(true)

  useEffect(() => { load() }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  // Build calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const hasScheduleOnDate = (d: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return items.some(s => s.startTime.startsWith(dateStr))
  }

  const isSelected = (d: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return dateStr === selectedDate
  }

  const isTodayDate = (d: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return dateStr === today
  }

  const selectedSchedules = selectedDate ? getByDate(selectedDate) : []

  // Switch to month view list
  const monthSchedules = items.filter(i => {
    const d = new Date(i.startTime)
    return d.getFullYear() === year && d.getMonth() === month
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const openAdd = () => {
    setEditItem(null)
    setTitle(''); setStartTime(selectedDate + 'T09:00'); setEndTime(selectedDate + 'T10:00')
    setLocation(''); setContactName(''); setContactPhone(''); setNotes('')
    setNotifyBefore(15); setNotifyEnabled(true); setShowModal(true)
  }

  const openEdit = (item: Schedule) => {
    setEditItem(item)
    setTitle(item.title); setStartTime(item.startTime); setEndTime(item.endTime)
    setLocation(item.location); setContactName(item.contactName); setContactPhone(item.contactPhone)
    setNotes(item.notes); setNotifyBefore(item.notifyBefore); setNotifyEnabled(item.notifyEnabled)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!title.trim() || !startTime) return
    const data = { title: title.trim(), startTime, endTime, location, contactName, contactPhone, notes, linkedTransport: '', notifyBefore, notifyEnabled }
    if (editItem) update(editItem.id, data)
    else add(data)
    setShowModal(false)
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  return (
    <div className="app-container">
      <PageHeader title="日程" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        {/* Calendar header */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="header-btn" onClick={prevMonth}>◀</button>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>{year}年{month + 1}月</span>
          <button className="header-btn" onClick={nextMonth}>▶</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--color-surface)', padding: '4px var(--spacing-lg)', borderBottom: '0.5px solid var(--color-border)' }}>
          {WEEKDAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>{d}</div>)}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--color-surface)', padding: '4px var(--spacing-lg) var(--spacing-md)' }}>
          {calendarDays.map((d, idx) => (
            <div key={idx} style={{ textAlign: 'center', padding: '4px 0', cursor: d ? 'pointer' : 'default' }}
              onClick={() => { if (d) { const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; setSelectedDate(ds) } }}
            >
              {d !== null && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: isSelected(d) ? 'var(--color-primary)' : isTodayDate(d) ? 'var(--color-primary-bg)' : 'transparent',
                  color: isSelected(d) ? 'white' : isTodayDate(d) ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontSize: 'var(--font-sm)', fontWeight: isTodayDate(d) || isSelected(d) ? 600 : 400,
                }}>
                  {d}
                  {hasScheduleOnDate(d) && (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected(d) ? 'white' : 'var(--color-primary)', marginTop: '1px' }} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected date schedules */}
        <div className="section-title">
          <span className="section-title-text">{selectedDate === today ? '今日' : selectedDate} 日程</span>
        </div>
        {selectedSchedules.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--spacing-lg)' }}>暂无日程，点击添加</div>
        ) : (
          selectedSchedules.map(s => (
            <div key={s.id} className="list-item" onClick={() => openEdit(s)} style={{ cursor: 'pointer' }}>
              <div className="list-item-icon" style={{ background: 'var(--color-schedule)18', color: 'var(--color-schedule)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                {formatTime(s.startTime)}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{s.title}</div>
                {s.location && <div className="list-item-subtitle">📍 {s.location}</div>}
              </div>
              <button className="header-btn" onClick={e => { e.stopPropagation(); setDeleteId(s.id) }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </button>
            </div>
          ))
        )}

        {/* Month schedule list */}
        {monthSchedules.length > 0 && (
          <>
            <div className="section-title"><span className="section-title-text">{month + 1}月全部日程</span></div>
            {monthSchedules.map(s => (
              <div key={s.id} className="list-item" onClick={() => openEdit(s)} style={{ cursor: 'pointer' }}>
                <div className="list-item-icon" style={{ background: 'var(--color-schedule)18', color: 'var(--color-schedule)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                  {formatTime(s.startTime)}
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{s.title}</div>
                  <div className="list-item-subtitle">{formatDate(s.startTime.split('T')[0])}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑日程' : '添加日程'}>
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="日程标题" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">开始时间</label>
            <input className="form-input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">结束时间</label>
            <input className="form-input" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">地点</label>
          <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="地点" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">联系人</label>
            <input className="form-input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="联系人姓名" />
          </div>
          <div className="form-group">
            <label className="form-label">电话</label>
            <input className="form-input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="联系电话" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">提前提醒</label>
            <select className="form-select" value={notifyBefore} onChange={e => setNotifyBefore(Number(e.target.value))}>
              <option value={0}>不提醒</option>
              <option value={5}>5分钟</option>
              <option value={15}>15分钟</option>
              <option value={30}>30分钟</option>
              <option value={60}>1小时</option>
              <option value={1440}>1天</option>
            </select>
          </div>
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '添加'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除日程" message="确定要删除这条日程吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
