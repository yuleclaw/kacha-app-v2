import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useExpenseStore } from '../store/useExpenseStore'
import { formatDate } from '../utils/date'
import { EXPENSE_CATEGORY_LABELS } from '../types'
import type { Expense } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface ExpensePageProps { onBack: () => void }

const CATEGORIES = ['food', 'transport', 'hotel', 'office', 'other'] as const

export default function ExpensePage({ onBack }: ExpensePageProps) {
  const store = useExpenseStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ amount: 0, category: 'other' as string, date: new Date().toISOString().slice(0, 10), description: '', imageUrl: '', status: 'pending' as string })

  const sorted = [...store.items].sort((a, b) => b.createdAt - a.createdAt)
  const stats = store.getStats()

  const openAdd = () => {
    setEditing(null)
    setForm({ amount: 0, category: 'other', date: new Date().toISOString().slice(0, 10), description: '', imageUrl: '', status: 'pending' })
    setShowAdd(true)
  }

  const openEdit = (item: Expense) => {
    setEditing(item)
    setForm({ amount: item.amount, category: item.category, date: item.date, description: item.description, imageUrl: item.imageUrl, status: item.status })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (form.amount <= 0) return
    const data: Expense = {
      id: editing?.id ?? generateId(),
      amount: form.amount,
      category: form.category as Expense['category'],
      date: form.date,
      description: form.description,
      imageUrl: form.imageUrl,
      status: (form.status as Expense['status']),
      createdAt: editing?.createdAt ?? Date.now(),
    }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  return (
    <>
      <PageHeader title="💰 报销" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 添加</button>
      } />

      <div className="page">
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">¥{stats.total.toFixed(0)}</div>
            <div className="stat-label">总计</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>¥{stats.pending.toFixed(0)}</div>
            <div className="stat-label">待报销</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>¥{stats.approved.toFixed(0)}</div>
            <div className="stat-label">已报销</div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">💰</div><p>暂无报销记录</p></div>
        ) : sorted.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
            <div className="flex-between">
              <div>
                <div className="card-title">
                  <span className={`tag ${item.status === 'approved' ? 'tag-success' : item.status === 'rejected' ? 'tag-danger' : 'tag-warning'}`} style={{ marginRight: 6 }}>
                    {item.status === 'approved' ? '已报销' : item.status === 'rejected' ? '已驳回' : '待报销'}
                  </span>
                  {EXPENSE_CATEGORY_LABELS[item.category] ?? item.category}
                </div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatDate(item.date)}
                  {item.description && <span style={{ marginLeft: 6 }}>· {item.description}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-danger)' }}>¥{item.amount}</div>
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }}
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑报销' : '添加报销'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">金额</label>
          <input className="form-input" type="number" min={0} step={0.01} value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">状态</label>
          <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">待报销</option>
            <option value="approved">已报销</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除报销" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
