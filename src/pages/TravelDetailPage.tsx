import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useTravelStore } from '../store/useTravelStore'
import { formatDate } from '../utils/date'
import { ACTIVITY_TYPE_LABELS } from '../types'
import type { TravelDay, TravelActivity } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface TravelDetailPageProps { travelId: string; onBack: () => void }

export default function TravelDetailPage({ travelId, onBack }: TravelDetailPageProps) {
  const store = useTravelStore()
  const travel = store.items.find((t) => t.id === travelId)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<{ dayId: string; activity: TravelActivity } | null>(null)
  const [deleteActivity, setDeleteActivity] = useState<{ dayId: string; activityId: string } | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [activeDay, setActiveDay] = useState(0)
  const [showEmergency, setShowEmergency] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState({ passport: '', embassyPhone: '', insurance: '' })
  const [showExpense, setShowExpense] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: 0, description: '' })
  const [form, setForm] = useState({ time: '', type: 'sightseeing' as string, title: '', description: '', location: '' })

  if (!travel) return <div className="page"><PageHeader title="行程详情" onBack={onBack} /><div className="empty-state"><p>行程不存在</p></div></div>

  const sortedDays = [...travel.days].sort((a, b) => a.date.localeCompare(b.date))
  const currentDay = sortedDays[activeDay]

  const addDayIfNeeded = () => {
    const start = new Date(travel.startDate); const end = new Date(travel.endDate)
    const existingDates = travel.days.map((d) => d.date)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10)
      if (!existingDates.includes(dateStr)) store.addDay(travelId, { id: genId(), date: dateStr, activities: [] })
    }
  }

  const openAddActivity = (dayId: string) => {
    setEditingActivity(null); setForm({ time: '', type: 'sightseeing', title: '', description: '', location: '' }); setShowAddActivity(true)
  }

  const openEditActivity = (dayId: string, activity: TravelActivity) => {
    setEditingActivity({ dayId, activity }); setForm({ time: activity.time, type: activity.type, title: activity.title, description: activity.description, location: activity.location }); setShowAddActivity(true)
  }

  const handleSaveActivity = () => {
    if (!form.title) return
    const data: TravelActivity = { id: editingActivity?.activity.id ?? genId(), time: form.time, type: form.type as TravelActivity['type'], title: form.title, description: form.description, location: form.location }
    if (editingActivity) { store.updateActivity(travelId, editingActivity.dayId, data.id, data) }
    else { const dayId = travel.days[activeDay]?.id; if (dayId) store.addActivity(travelId, dayId, data) }
    setShowAddActivity(false)
  }

  const handlePaste = () => {
    const lines = pasteText.split('\n').filter((l) => l.trim())
    const dayId = travel.days[activeDay]?.id
    if (!dayId) return
    lines.forEach((line) => {
      const match = line.match(/(\d{1,2}:\d{2})\s+(.+)/)
      if (match) store.addActivity(travelId, dayId, { id: genId(), time: match[1] || '', type: 'sightseeing', title: match[2]?.trim() || '', description: '', location: '' })
    })
    setShowPaste(false); setPasteText('')
  }

  const handleEmergencySave = () => {
    store.update(travelId, { emergencyInfo: { passport: emergencyForm.passport, embassyPhone: emergencyForm.embassyPhone, insurance: emergencyForm.insurance } })
    setShowEmergency(false)
  }

  const handleExpenseAdd = () => {
    if (expenseForm.amount <= 0) return
    store.addExpense(travelId, { category: expenseForm.category, amount: expenseForm.amount, description: expenseForm.description })
    setExpenseForm({ category: '', amount: 0, description: '' })
  }

  return (
    <>
      <PageHeader title={travel.name} onBack={onBack} right={
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => { setEmergencyForm({ passport: travel.emergencyInfo?.passport || '', embassyPhone: travel.emergencyInfo?.embassyPhone || '', insurance: travel.emergencyInfo?.insurance || '' }); setShowEmergency(true) }}>紧急</button>
          <button className="btn btn-sm btn-ghost" onClick={() => { addDayIfNeeded(); setShowPaste(true) }}>粘贴</button>
        </div>
      } />

      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {sortedDays.map((day, i) => (
            <span key={day.id} className={`tag ${activeDay === i ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setActiveDay(i)}>
              Day{i + 1} {day.date.slice(5)}
            </span>
          ))}
          <span className="tag" style={{ cursor: 'pointer', border: '1px dashed var(--color-border)' }}
            onClick={() => { const ds = new Date(); store.addDay(travelId, { id: genId(), date: ds.toISOString().slice(0, 10), activities: [] }) }}>+ 天</span>
        </div>

        {currentDay ? (
          <>
            <div className="flex-between mb-sm">
              <span className="text-sm text-secondary">{formatDate(currentDay.date)}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowExpense(true)}>💰费用</button>
                <button className="btn btn-sm btn-primary" onClick={() => openAddActivity(currentDay.id)}>+ 活动</button>
              </div>
            </div>
            {currentDay.activities.length === 0 ? (
              <div className="empty-state"><div className="icon">🗓️</div><p>暂无活动</p></div>
            ) : (
              [...currentDay.activities].sort((a, b) => a.time.localeCompare(b.time)).map((act) => (
                <div key={act.id} className="card" style={{ cursor: 'pointer', padding: '12px 16px' }} onClick={() => openEditActivity(currentDay.id, act)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', minWidth: 48 }}>{act.time}</div>
                    <div style={{ flex: 1 }}>
                      <div className="flex-between"><span className="card-title">{act.title}</span><span className="tag tag-primary">{ACTIVITY_TYPE_LABELS[act.type] || act.type}</span></div>
                      {act.location && <div className="card-subtitle" style={{ marginTop: 2 }}>📍 {act.location}</div>}
                      {act.description && <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{act.description}</div>}
                    </div>
                  </div>
                </div>
              ))
            )}
            {travel.expenses && travel.expenses.length > 0 && (
              <div className="card" style={{ marginTop: 8 }}>
                <div className="card-title mb-sm">旅行费用</div>
                {travel.expenses.map((ex, i) => (
                  <div key={i} className="flex-between" style={{ padding: '2px 0' }}>
                    <span style={{ fontSize: 12 }}>{ex.category} {ex.description}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>¥{ex.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : <div className="empty-state"><p>点击"+ 天"创建日程</p></div>}
      </div>

      <Modal open={showAddActivity} title={editingActivity ? '编辑活动' : '添加活动'} onClose={() => setShowAddActivity(false)}>
        <div className="form-group"><label className="form-label">时间</label><input className="form-input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(ACTIVITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">标题</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">地点</label><input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">描述</label><textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveActivity}>{editingActivity ? '保存' : '添加'}</button>
      </Modal>

      <Modal open={showPaste} title="粘贴行程" onClose={() => setShowPaste(false)}>
        <div className="form-group"><label className="form-label">粘贴行程单（每行：时间 活动）</label>
          <textarea className="form-textarea" rows={6} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="09:00 抵达大阪关西机场&#10;11:00 心斋桥购物" /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePaste} disabled={!pasteText.trim()}>解析并添加</button>
      </Modal>

      <Modal open={showEmergency} title="紧急信息" onClose={() => setShowEmergency(false)}>
        <div className="form-group"><label className="form-label">护照号</label><input className="form-input" value={emergencyForm.passport} onChange={(e) => setEmergencyForm({ ...emergencyForm, passport: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">大使馆电话</label><input className="form-input" value={emergencyForm.embassyPhone} onChange={(e) => setEmergencyForm({ ...emergencyForm, embassyPhone: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">保险信息</label><textarea className="form-textarea" value={emergencyForm.insurance} onChange={(e) => setEmergencyForm({ ...emergencyForm, insurance: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleEmergencySave}>保存</button>
      </Modal>

      <Modal open={showExpense} title="添加费用" onClose={() => setShowExpense(false)}>
        <div className="form-group"><label className="form-label">类型</label><input className="form-input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} placeholder="餐饮/门票/交通" /></div>
        <div className="form-group"><label className="form-label">金额</label><input className="form-input" type="number" min={0} value={expenseForm.amount || ''} onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-group"><label className="form-label">描述</label><input className="form-input" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExpenseAdd}>添加</button>
      </Modal>

      <ConfirmDialog open={deleteActivity !== null} title="删除活动" message="确定删除？" danger
        onConfirm={() => { if (deleteActivity) { store.removeActivity(travelId, deleteActivity.dayId, deleteActivity.activityId); setDeleteActivity(null) } }}
        onCancel={() => setDeleteActivity(null)} />
    </>
  )
}
