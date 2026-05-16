import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useExpenseStore } from '../store/useExpenseStore'
import { formatDate } from '../utils/date'
import { EXPENSE_CATEGORY_LABELS, SUBSIDY_LABELS, TRANSPORT_TYPE_LABELS } from '../types'
import type { ExpenseItem, ExpenseCategory, TransportType } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
interface ExpensePageProps { onBack: () => void }

const CATEGORIES: { value: ExpenseCategory; label: string }[] =
  Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => ({ value: k as ExpenseCategory, label: v }))

export default function ExpensePage({ onBack }: ExpensePageProps) {
  const store = useExpenseStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<ExpenseItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    amount: 0, category: 'food' as string, date: new Date().toISOString().slice(0, 10),
    description: '', status: 'pending' as string,
    transportType: '' as string, from: '', to: '', km: 0, unitPrice: 0,
    subsidyType: '' as string, days: 1,
    hotelName: '', nights: 1,
    invoiceNumber: '', notes: '', invoicePhoto: '',
  })

  const handleInvoiceUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => setForm({ ...form, invoicePhoto: ev.target?.result as string || '' })
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const sorted = [...store.items].sort((a, b) => b.createdAt - a.createdAt)
  const stats = store.getStats()

  const catAmount = (cat: string) => store.items.filter(i => i.category === cat).reduce((s, i) => s + i.amount, 0)

  const openAdd = () => {
    setEditing(null)
    setForm({ amount: 0, category: 'food', date: new Date().toISOString().slice(0, 10), description: '', status: 'pending', transportType: '', from: '', to: '', km: 0, unitPrice: 0, subsidyType: '', days: 1, hotelName: '', nights: 1, invoiceNumber: '', notes: '', invoicePhoto: '' })
    setShowAdd(true)
  }

  const openEdit = (item: ExpenseItem) => {
    setEditing(item)
    setForm({
      amount: item.amount, category: item.category, date: item.date, description: item.description, status: item.status,
      transportType: item.transportType || '', from: item.from || '', to: item.to || '', km: item.km || 0, unitPrice: item.unitPrice || 0,
      subsidyType: item.subsidyType || '', days: item.days || 1,
      hotelName: item.hotelName || '', nights: item.nights || 1,
      invoiceNumber: item.invoiceNumber || '', notes: item.notes || '', invoicePhoto: item.invoicePhoto || '',
    })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (form.amount <= 0) return
    const data: ExpenseItem = {
      id: editing?.id ?? genId(),
      amount: form.amount,
      category: form.category as ExpenseCategory,
      date: form.date,
      description: form.description,
      status: form.status as ExpenseItem['status'],
      transportType: form.transportType ? (form.transportType as TransportType) : undefined,
      from: form.from || undefined, to: form.to || undefined,
      km: form.km || undefined, unitPrice: form.unitPrice || undefined,
      subsidyType: form.subsidyType ? (form.subsidyType as 'standard' | 'special' | 'executive') : undefined,
      days: form.days || undefined,
      hotelName: form.hotelName || undefined, nights: form.nights || undefined,
      invoiceNumber: form.invoiceNumber || undefined, notes: form.notes || undefined,
      invoicePhoto: form.invoicePhoto || undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  // Auto-calculate transport cost
  const calcKmCost = () => (form.km || 0) * (form.unitPrice || 0.8)
  // Auto-calculate food subsidy
  const calcSubsidy = () => {
    const rates: Record<string, number> = { standard: 100, special: 150, executive: 200 }
    return (form.days || 1) * (rates[form.subsidyType] || 0)
  }

  return (
    <>
      <PageHeader title="报销" onBack={onBack} right={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-value">¥{stats.total.toFixed(0)}</div><div className="stat-label">总计</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>¥{stats.pending.toFixed(0)}</div><div className="stat-label">待报销</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>¥{stats.approved.toFixed(0)}</div><div className="stat-label">已报销</div></div>
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
                  {EXPENSE_CATEGORY_LABELS[item.category] || item.category}
                </div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatDate(item.date)} {item.description ? `· ${item.description}` : ''}
                </div>
                {item.km ? <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>🚗 {item.km}km</div> : null}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-danger)' }}>¥{item.amount.toFixed(0)}</div>
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑报销' : '添加报销'} onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Transport fields */}
        {form.category === 'transport' && (
          <>
            <div className="form-group">
              <label className="form-label">交通方式</label>
              <select className="form-select" value={form.transportType} onChange={(e) => setForm({ ...form, transportType: e.target.value })}>
                <option value="">选择</option>
                {Object.entries(TRANSPORT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">起点</label><input className="form-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">终点</label><input className="form-input" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
            </div>
            {form.transportType === 'self-drive' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">里程(km)</label><input className="form-input" type="number" value={form.km || ''} onChange={(e) => setForm({ ...form, km: parseFloat(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">单价(元/km)</label><input className="form-input" type="number" step={0.1} value={form.unitPrice || ''} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            )}
          </>
        )}

        {/* Food subsidy fields */}
        {form.category === 'food' && (
          <>
            <div className="form-group">
              <label className="form-label">补贴类型</label>
              <select className="form-select" value={form.subsidyType} onChange={(e) => setForm({ ...form, subsidyType: e.target.value })}>
                <option value="">选择</option>
                {Object.entries(SUBSIDY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {form.subsidyType && (
              <div className="form-group"><label className="form-label">天数</label><input className="form-input" type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 1 })} /></div>
            )}
          </>
        )}

        {/* Hotel fields */}
        {form.category === 'hotel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">酒店名</label><input className="form-input" value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">晚数</label><input className="form-input" type="number" min={1} value={form.nights} onChange={(e) => setForm({ ...form, nights: parseInt(e.target.value) || 1 })} /></div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">金额</label>
          <input className="form-input" type="number" min={0} step={0.01} value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
        </div>
        {form.category === 'transport' && form.transportType === 'self-drive' && form.km > 0 && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: -8, marginBottom: 12 }}>预估: ¥{calcKmCost().toFixed(0)}</div>
        )}
        {form.category === 'food' && form.subsidyType && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: -8, marginBottom: 12 }}>预估: ¥{calcSubsidy().toFixed(0)}</div>
        )}
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">状态</label>
          <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">待报销</option><option value="approved">已报销</option><option value="rejected">已驳回</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">发票信息</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="发票号" style={{ flex: 1 }} />
            <button className="btn btn-sm btn-ghost" onClick={handleInvoiceUpload}>{form.invoicePhoto ? '已拍照' : '拍照'}</button>
          </div>
          {form.invoicePhoto && <img src={form.invoicePhoto} alt="发票" style={{ width: '100%', maxHeight: 100, objectFit: 'contain', marginTop: 4, borderRadius: 6 }} />}
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editing ? '保存' : '添加'}</button>
      </Modal>
      <ConfirmDialog open={deleteId !== null} title="删除" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
