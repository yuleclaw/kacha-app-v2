import React, { useEffect, useState } from 'react'
import { useAnniversaryStore } from '@/store/useAnniversaryStore'
import { Anniversary, CATEGORY_LABELS } from '@/types'
import { formatCountdown, formatDate, generateId } from '@/utils/date'
import { formatLunar } from '@/utils/lunar'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import Toggle from '@/components/Toggle'
import ConfirmDialog from '@/components/ConfirmDialog'

interface AnniversaryPageProps {
  onBack: () => void
}

type FilterCategory = 'all' | Anniversary['category']

export default function AnniversaryPage({ onBack }: AnniversaryPageProps) {
  const { items, load, add, update, remove, toggleNotify, getUpcoming } = useAnniversaryStore()
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Anniversary | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<Anniversary['category']>('birthday')
  const [repeatYearly, setRepeatYearly] = useState(true)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [notifyBefore, setNotifyBefore] = useState(3)
  const [lunar, setLunar] = useState(false)

  useEffect(() => { load() }, [])

  const filteredItems = items
    .filter(i => filter === 'all' || i.category === filter)
    .sort((a, b) => {
      const nextA = new Date(a.repeatYearly ? `${new Date().getFullYear()}-${a.date.slice(5)}` : a.date)
      const nextB = new Date(b.repeatYearly ? `${new Date().getFullYear()}-${b.date.slice(5)}` : b.date)
      return nextA.getTime() - nextB.getTime()
    })

  const openAdd = () => {
    setEditItem(null)
    setTitle(''); setDate(''); setCategory('birthday')
    setRepeatYearly(true); setNotifyEnabled(true); setNotifyBefore(3); setLunar(false)
    setShowModal(true)
  }

  const openEdit = (item: Anniversary) => {
    setEditItem(item)
    setTitle(item.title); setDate(item.date); setCategory(item.category)
    setRepeatYearly(item.repeatYearly); setNotifyEnabled(item.notifyEnabled)
    setNotifyBefore(item.notifyBefore); setLunar(item.lunar)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!title.trim() || !date) return
    if (editItem) {
      update(editItem.id, { title: title.trim(), date, category, repeatYearly, notifyEnabled, notifyBefore, lunar })
    } else {
      add({ title: title.trim(), date, category, repeatYearly, notifyEnabled, notifyBefore, lunar, notifyTimes: [8] })
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (deleteId) { remove(deleteId); setDeleteId(null) }
  }

  const getDaysUntil = (item: Anniversary): number => {
    const now = new Date()
    let target = new Date(item.date)
    if (item.repeatYearly) {
      target = new Date(`${now.getFullYear()}-${item.date.slice(5)}`)
      if (target < now) target.setFullYear(now.getFullYear() + 1)
    }
    return Math.ceil((target.getTime() - now.getTime()) / 86400000)
  }

  return (
    <div className="app-container">
      <PageHeader
        title="纪念日"
        onBack={onBack}
        rightAction={
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>
        }
      />
      <div className="page">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)', overflowX: 'auto' }}>
          {(['all', 'birthday', 'love', 'work', 'other'] as FilterCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-sm)', fontWeight: 500,
                background: filter === cat ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                color: filter === cat ? 'white' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💜</div>
            <div className="empty-state-text">暂无纪念日</div>
          </div>
        ) : (
          filteredItems.map(item => {
            const days = getDaysUntil(item)
            return (
              <div
                key={item.id}
                className="list-item"
                onClick={() => openEdit(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="list-item-icon" style={{ background: 'var(--color-anniversary)18' }}>
                  {item.category === 'birthday' ? '🎂' : item.category === 'love' ? '💕' : '💜'}
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{item.title}</div>
                  <div className="list-item-subtitle">
                    {formatDate(item.date)}
                    {item.lunar && ` (${formatLunar(item.date)})`}
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginRight: 'var(--spacing-sm)' }}>
                  <div style={{
                    fontSize: days <= 0 ? 'var(--font-xl)' : 'var(--font-lg)',
                    fontWeight: 700,
                    color: days <= 0 ? 'var(--color-anniversary)' : 'var(--color-primary)',
                  }}>
                    {days <= 0 ? '🎉' : days}
                  </div>
                  {days > 0 && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>天</div>}
                </div>
                <button
                  className="header-btn"
                  onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? '编辑纪念日' : '添加纪念日'}
      >
        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="纪念日名称" />
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">分类</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Anniversary['category'])}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">提前提醒</label>
            <select className="form-select" value={notifyBefore} onChange={e => setNotifyBefore(Number(e.target.value))}>
              <option value={0}>当天</option>
              <option value={1}>1天</option>
              <option value={3}>3天</option>
              <option value={7}>7天</option>
              <option value={14}>14天</option>
              <option value={30}>30天</option>
            </select>
          </div>
        </div>
        <div className="form-row" style={{ alignItems: 'center', padding: 'var(--spacing-sm) 0' }}>
          <div className="flex items-center gap-sm">
            <Toggle active={lunar} onChange={setLunar} />
            <span style={{ fontSize: 'var(--font-sm)' }}>农历</span>
          </div>
          <div className="flex items-center gap-sm">
            <Toggle active={repeatYearly} onChange={setRepeatYearly} />
            <span style={{ fontSize: 'var(--font-sm)' }}>每年重复</span>
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
          <div className="flex items-center gap-sm">
            <Toggle active={notifyEnabled} onChange={setNotifyEnabled} />
            <span style={{ fontSize: 'var(--font-sm)' }}>开启提醒</span>
          </div>
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {editItem ? '保存' : '添加'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="删除纪念日"
        message="确定要删除这个纪念日吗？"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
