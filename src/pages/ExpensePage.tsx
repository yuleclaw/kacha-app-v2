import React, { useState, useEffect } from 'react'
import { useExpenseStore } from '@/store/useExpenseStore'
import { Expense, EXPENSE_CATEGORY_LABELS } from '@/types'
import { formatDate } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ExpensePageProps {
  onBack: () => void
}

const STATUS_LABELS: Record<string, { label: string; tagClass: string }> = {
  pending: { label: '待报销', tagClass: 'tag-warning' },
  approved: { label: '已报销', tagClass: 'tag-success' },
  rejected: { label: '已拒绝', tagClass: 'tag-danger' },
}

export default function ExpensePage({ onBack }: ExpensePageProps) {
  const { items, load, add, update, remove, updateStatus, getStats } = useExpenseStore()
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Expense['category']>('food')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Expense['status']>('pending')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => { load() }, [])

  const stats = getStats()

  const filtered = items
    .filter(i => filter === 'all' || i.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt)

  const openAdd = () => {
    setEditItem(null); setAmount(''); setCategory('food')
    setDate(new Date().toISOString().split('T')[0]); setDescription('')
    setStatus('pending'); setImageUrl(''); setShowModal(true)
  }

  const openEdit = (item: Expense) => {
    setEditItem(item); setAmount(String(item.amount)); setCategory(item.category)
    setDate(item.date); setDescription(item.description); setStatus(item.status)
    setImageUrl(item.imageUrl); setShowModal(true)
  }

  const handleSave = () => {
    if (!amount || !date) return
    const data = { amount: Number(amount), category, date, description, status, imageUrl }
    if (editItem) update(editItem.id, data)
    else add(data)
    setShowModal(false)
  }

  return (
    <div className="app-container">
      <PageHeader title="报销管理" onBack={onBack} rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />

      {/* Stats summary */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', marginBottom: 0, padding: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-tertiary)' }}>总计</div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>¥{stats.total.toFixed(0)}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', marginBottom: 0, padding: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-warning)' }}>待报销</div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-warning)' }}>¥{stats.pending.toFixed(0)}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', marginBottom: 0, padding: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-success)' }}>已报销</div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-success)' }}>¥{stats.approved.toFixed(0)}</div>
        </div>
      </div>

      <div className="page">
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
              color: filter === f ? 'white' : 'var(--color-text-secondary)',
            }}>
              {f === 'all' ? '全部' : STATUS_LABELS[f]?.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💰</div><div className="empty-state-text">暂无报销记录</div></div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="list-item" onClick={() => openEdit(item)} style={{ cursor: 'pointer' }}>
              <div className="list-item-icon" style={{ background: 'var(--color-expense)18', color: 'var(--color-expense)', fontWeight: 600, fontSize: 'var(--font-md)' }}>
                ¥{item.amount.toFixed(0)}
              </div>
              <div className="list-item-content">
                <div className="flex items-center gap-sm">
                  <span className="list-item-title">{item.description || EXPENSE_CATEGORY_LABELS[item.category]}</span>
                  <span className={`tag ${STATUS_LABELS[item.status].tagClass}`}>{STATUS_LABELS[item.status].label}</span>
                </div>
                <div className="list-item-subtitle">
                  {EXPENSE_CATEGORY_LABELS[item.category]} | {formatDate(item.date)}
                </div>
              </div>
              <button className="header-btn" onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑报销' : '添加报销'}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">金额</label>
            <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="金额" />
          </div>
          <div className="form-group">
            <label className="form-label">分类</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Expense['category'])}>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">日期</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">状态</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value as Expense['status'])}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="报销描述" rows={2} />
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editItem ? '保存' : '添加'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除报销" message="确定要删除这条报销记录吗？" danger onConfirm={() => { if (deleteId) { remove(deleteId); setDeleteId(null) } }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
