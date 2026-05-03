import React, { useState, useEffect } from 'react'
import { useTravelStore } from '@/store/useTravelStore'
import { Travel, Activity } from '@/types'
import { formatDate, generateId } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface TravelPageProps {
  onBack: () => void
  onNavigate: (page: string, travelId?: string) => void
}

export default function TravelPage({ onBack, onNavigate }: TravelPageProps) {
  const { items, load, remove, updateStatus } = useTravelStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Travel | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [companions, setCompanions] = useState('')

  const sorted = [...items].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  const openAdd = () => {
    setEditItem(null); setName(''); setStartDate(''); setEndDate(''); setCompanions(''); setShowModal(true)
  }

  const handleSave = () => {
    if (!name.trim() || !startDate || !endDate) return
    const days: Travel['days'] = []
    const s = new Date(startDate)
    const e = new Date(endDate)
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      days.push({ id: generateId(), date: d.toISOString().split('T')[0], activities: [] })
    }
    const data = { name: name.trim(), startDate, endDate, days, companions: companions.split('').map(s => s.trim()).filter(Boolean), status: 'planning' as const }
    if (editItem) {
      const updated = { ...editItem, ...data, days: data.days.length === editItem.days.length ? editItem.days : data.days }
      remove(editItem.id)
      const { load: l, add } = useTravelStore.getState()
      add(updated as any)
    } else {
      useTravelStore.getState().add(data as any)
    }
    setShowModal(false)
  }

  const getStatusLabel = (s: string) => s === 'planning' ? '计划中' : s === 'ongoing' ? '进行中' : '已完成'

  return (
    <div className="app-container">
      <PageHeader title="旅行" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        {sorted.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✈️</div><div className="empty-state-text">暂无旅行计划</div></div>
        ) : sorted.map(t => (
          <div key={t.id} className="list-item" onClick={() => onNavigate('travel-detail', t.id)} style={{ cursor: 'pointer' }}>
            <div className="list-item-icon" style={{ background: 'var(--color-travel)18', fontSize: '18px' }}>✈️</div>
            <div className="list-item-content" >
              <div className="flex items-center gap-sm">
                <span className="list-item-title">{t.name}</span>
                <span className="tag tag-info">{getStatusLabel(t.status)}</span>
              </div>
              <div className="list-item-subtitle">{formatDate(t.startDate)} ~ {formatDate(t.endDate)}{t.companions.length > 0 && ` | ${t.companions.join(', ')}`}</div>
              <div className="list-item-subtitle">共{t.days.length}天 | {t.days.reduce((sum, d) => sum + d.activities.length, 0)}个活动</div>
            </div>
            <button className="header-btn" onClick={e => { e.stopPropagation(); setDeleteId(t.id) }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" /></svg>
            </button>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑旅行' : '新建旅行'}>
        <div className="form-group"><label className="form-label">旅行名称</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="旅行名称" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">开始日期</label><input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">结束日期</label><input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">同行人（空格分隔）</label><input className="form-input" value={companions} onChange={e => setCompanions(e.target.value)} placeholder="姓名 姓名" /></div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}><button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '创建'}</button></div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除旅行" message="确定要删除这个旅行计划吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
