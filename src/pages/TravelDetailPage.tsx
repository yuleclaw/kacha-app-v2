import React, { useState, useEffect } from 'react'
import { useTravelStore } from '@/store/useTravelStore'
import { Activity } from '@/types'
import { formatDate, generateId } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface TravelDetailPageProps {
  travelId: string
  onBack: () => void
}

const ACTIVITY_TYPES = ['transport', 'sightseeing', 'food', 'hotel', 'shopping', 'other'] as const
const TYPE_ICONS: Record<string, string> = { transport: '🚗', sightseeing: '🏛️', food: '🍜', hotel: '🏨', shopping: '🛍️', other: '📌' }

export default function TravelDetailPage({ travelId, onBack }: TravelDetailPageProps) {
  const { items, update, addDay, addActivity, removeActivity } = useTravelStore()
  const [travel, setTravel] = useState(items.find(t => t.id === travelId))
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<{ dayIdx: number; act: Activity } | null>(null)

  const [time, setTime] = useState('09:00')
  const [type, setType] = useState<Activity['type']>('sightseeing')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [pasteText, setPasteText] = useState('')

  useEffect(() => { setTravel(items.find(t => t.id === travelId)) }, [items, travelId])

  // If travel not found, go back
  if (!travel) { onBack(); return null }

  const handleSaveActivity = () => {
    if (!title.trim()) return
    const activity: Activity = { id: editingActivity?.act.id || generateId(), time, type, title: title.trim(), description, location }
    if (editingActivity) {
      const newDays = [...travel.days]
      const day = { ...newDays[editingActivity.dayIdx] }
      day.activities = day.activities.map(a => a.id === editingActivity.act.id ? activity : a).sort((a, b) => a.time.localeCompare(b.time))
      newDays[editingActivity.dayIdx] = day
      update(travel.id, { days: newDays })
    } else {
      addActivity(travel.id, travel.days[selectedDayIdx].id, activity)
    }
    setShowActivityModal(false)
    setTravel(items.find(t => t.id === travelId))
  }

  const openAddActivity = (dayIdx: number) => {
    setSelectedDayIdx(dayIdx); setEditingActivity(null)
    setTime('09:00'); setType('sightseeing'); setTitle(''); setLocation(''); setDescription('')
    setShowActivityModal(true)
  }

  const openEditActivity = (dayIdx: number, act: Activity) => {
    setSelectedDayIdx(dayIdx); setEditingActivity({ dayIdx, act })
    setTime(act.time); setType(act.type); setTitle(act.title); setLocation(act.location); setDescription(act.description)
    setShowActivityModal(true)
  }

  const handlePasteParse = () => {
    // Simple paste parser - look for date patterns
    alert('粘贴识别功能：请将行程单粘贴到输入框，AI将自动识别并填充。\n\n当前版本建议手动添加行程。')
    setShowPasteModal(false)
  }

  return (
    <div className="app-container">
      <PageHeader
        title={travel.name}
        onBack={onBack}
        rightAction={
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPasteModal(true)}>📋 粘贴识别</button>
        }
      />

      <div className="page">
        {/* Trip info */}
        <div className="card">
          <div className="flex items-center gap-sm mb-sm">
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              {formatDate(travel.startDate)} ~ {formatDate(travel.endDate)}
            </span>
            <span className="tag tag-info">{travel.days.length}天</span>
          </div>
          {travel.companions.length > 0 && (
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              同行人：{travel.companions.join('、')}
            </div>
          )}
        </div>

        {/* Day tabs */}
        {travel.days.map((day, idx) => (
          <div key={day.id} style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="section-title">
              <span className="section-title-text">
                Day {idx + 1} · {day.date}
                {day.activities.length > 0 && <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>{day.activities.length}个活动</span>}
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => openAddActivity(idx)}>+ 添加</button>
            </div>

            {day.activities.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--spacing-lg)' }}>
                暂无活动，点击添加
              </div>
            ) : (
              day.activities.map(act => (
                <div key={act.id} className="list-item" onClick={() => openEditActivity(idx, act)} style={{ cursor: 'pointer' }}>
                  <div className="list-item-icon" style={{ background: 'var(--color-travel)18', fontSize: '16px' }}>
                    {TYPE_ICONS[act.type] || '📌'}
                  </div>
                  <div className="list-item-content">
                    <div className="flex items-center gap-sm">
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', width: '40px', flexShrink: 0 }}>{act.time}</span>
                      <span className="list-item-title">{act.title}</span>
                    </div>
                    {act.location && <div className="list-item-subtitle">📍 {act.location}</div>}
                  </div>
                  <button
                    className="header-btn"
                    onClick={e => { e.stopPropagation(); removeActivity(travel.id, day.id, act.id) }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Activity Modal */}
      <Modal open={showActivityModal} onClose={() => setShowActivityModal(false)} title={editingActivity ? '编辑活动' : '添加活动'}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">时间</label>
            <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">类型</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as Activity['type'])}>
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t === 'transport' ? '交通' : t === 'sightseeing' ? '景点' : t === 'food' ? '美食' : t === 'hotel' ? '住宿' : t === 'shopping' ? '购物' : '其他'}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="活动标题" />
        </div>
        <div className="form-group">
          <label className="form-label">地点</label>
          <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="地点（可选）" />
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="描述（可选）" rows={2} />
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveActivity}>
            {editingActivity ? '保存' : '添加'}
          </button>
        </div>
      </Modal>

      {/* Paste Parse Modal */}
      <Modal open={showPasteModal} onClose={() => setShowPasteModal(false)} title="粘贴识别行程">
        <div className="form-group">
          <label className="form-label">粘贴行程单内容</label>
          <textarea
            className="form-input"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="粘贴行程单文本，系统将自动识别日期、活动、地点..."
            rows={6}
          />
        </div>
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
          提示：简单粘贴将提示手动添加。完整版将支持自动解析携程、飞猪等行程单格式。
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePasteParse}>解析并填充</button>
        </div>
      </Modal>
    </div>
  )
}
