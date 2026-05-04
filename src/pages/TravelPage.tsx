import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useTravelStore } from '../store/useTravelStore'
import { formatDate } from '../utils/date'
import type { Travel, PageName } from '../types'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

interface TravelPageProps {
  onBack: () => void
  onNavigate: (page: PageName, travelId: string) => void
}

export default function TravelPage({ onBack, onNavigate }: TravelPageProps) {
  const store = useTravelStore()
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', companions: '', status: 'planning' as string })

  const sorted = [...store.items].sort((a, b) => a.startDate.localeCompare(b.startDate))

  const openAdd = () => {
    setForm({ name: '', startDate: '', endDate: '', companions: '', status: 'planning' })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.name || !form.startDate) return
    const data: Travel = {
      id: generateId(),
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      days: [],
      companions: form.companions ? form.companions.split(/[,，、\s]+/).filter(Boolean) : [],
      status: form.status as Travel['status'],
    }
    store.add(data)
    setShowAdd(false)
    onNavigate('travel-detail', data.id)
  }

  return (
    <>
      <PageHeader title="✈️ 旅行" onBack={onBack} right={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>＋ 新建</button>
      } />

      <div className="page">
        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">✈️</div><p>暂无旅行计划</p></div>
        ) : sorted.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('travel-detail', item.id)}>
            <div className="flex-between">
              <div>
                <div className="card-title">{item.name}</div>
                <div className="card-subtitle" style={{ marginTop: 2 }}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <span className={`tag ${item.status === 'planning' ? 'tag-warning' : item.status === 'ongoing' ? 'tag-success' : ''}`}>
                    {item.status === 'planning' ? '计划中' : item.status === 'ongoing' ? '进行中' : '已完成'}
                  </span>
                  {item.companions.length > 0 && (
                    <span className="tag tag-primary">{item.companions.join(', ')}</span>
                  )}
                </div>
              </div>
              <button className="btn btn-sm btn-ghost"
                onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title="新建行程" onClose={() => setShowAdd(false)}>
        <div className="form-group">
          <label className="form-label">行程名称</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：日本关西之旅" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">开始日期</label>
            <input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">结束日期</label>
            <input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">同行人（用逗号分隔）</label>
          <input className="form-input" value={form.companions} onChange={(e) => setForm({ ...form, companions: e.target.value })} placeholder="张三、李四" />
        </div>
        <div className="form-group">
          <label className="form-label">状态</label>
          <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="planning">计划中</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          创建并进入行程
        </button>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="删除行程" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
