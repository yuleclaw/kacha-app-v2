import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { useFlashStore } from '../store/useFlashStore'
import { formatDateTime, getCountdownText, isFlashSoon } from '../utils/date'
import { PLATFORM_LABELS } from '../types'
import { openDeepLink, copyToClipboard } from '../utils/deepLink'
import type { FlashSale } from '../types'

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
interface FlashPageProps { onBack: () => void }

const PLATFORMS = ['jd', 'taobao', 'pinduoduo', 'dewu'] as const

export default function FlashPage({ onBack }: FlashPageProps) {
  const store = useFlashStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<FlashSale | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ productName: '', platform: 'jd' as string, originalPrice: '', salePrice: '', startTime: '', productUrl: '', notifyEnabled: true, notifyMinutesBefore: [60, 10, 1, 0] })

  const sorted = [...store.items].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const openAdd = () => {
    setEditing(null)
    setForm({ productName: '', platform: 'jd', originalPrice: '', salePrice: '', startTime: '', productUrl: '', notifyEnabled: true, notifyMinutesBefore: [60, 10, 1, 0] })
    setShowAdd(true)
  }

  const openEdit = (item: FlashSale) => {
    setEditing(item)
    setForm({ productName: item.productName, platform: item.platform, originalPrice: item.originalPrice, salePrice: item.salePrice, startTime: item.startTime, productUrl: item.productUrl, notifyEnabled: item.notifyEnabled, notifyMinutesBefore: item.notifyMinutesBefore })
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!form.productName || !form.startTime) return
    const data: FlashSale = {
      id: editing?.id ?? genId(),
      productName: form.productName,
      platform: form.platform as FlashSale['platform'],
      originalPrice: form.originalPrice,
      salePrice: form.salePrice,
      startTime: form.startTime,
      productUrl: form.productUrl,
      notifyEnabled: form.notifyEnabled,
      notifyMinutesBefore: form.notifyMinutesBefore,
      createdAt: editing?.createdAt ?? Date.now(),
    }
    if (editing) store.update(data.id, data)
    else store.add(data)
    setShowAdd(false)
  }

  const PRESET_MINUTES = [60, 10, 1, 0]

  return (
    <>
      <PageHeader title="秒杀管理" onBack={onBack} right={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>} />
      <div className="page">
        {sorted.length === 0 ? (
          <div className="empty-state"><div className="icon">⚡</div><p>暂无秒杀活动</p></div>
        ) : sorted.map((item) => (
          <div key={item.id} className="card">
            <div style={{ cursor: 'pointer' }} onClick={() => openEdit(item)}>
              <div className="flex-between">
                <div>
                  <div className="card-title">{item.productName}</div>
                  <div className="card-subtitle" style={{ marginTop: 2 }}>
                    <span className="tag tag-primary">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                    {item.originalPrice && <span style={{ textDecoration: 'line-through', marginLeft: 6, color: 'var(--color-text-tertiary)' }}>¥{item.originalPrice}</span>}
                    {item.salePrice && <span style={{ color: 'var(--color-danger)', fontWeight: 500, marginLeft: 6 }}>¥{item.salePrice}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{formatDateTime(item.startTime)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: isFlashSoon(item.startTime) ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>{getCountdownText(item.startTime)}</div>
                  <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}>删除</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              {item.productUrl && (
                <button className="btn btn-sm btn-primary" onClick={() => openDeepLink(item.platform, item.productUrl)}>打开App</button>
              )}
              {item.productUrl && (
                <button className="btn btn-sm btn-ghost" onClick={async () => { await copyToClipboard(item.productUrl || '') }}>复制链接</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} title={editing ? '编辑秒杀' : '添加秒杀'} onClose={() => setShowAdd(false)}>
        <div className="form-group"><label className="form-label">商品名称</label><input className="form-input" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">平台</label>
          <select className="form-select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">原价</label><input className="form-input" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">秒杀价</label><input className="form-input" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">开始时间</label><input className="form-input" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">商品链接</label><input className="form-input" value={form.productUrl} onChange={(e) => setForm({ ...form, productUrl: e.target.value })} /></div>
        <div className="form-group">
          <label className="form-label">提醒时间</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESET_MINUTES.map((m) => (
              <span key={m} className={`tag ${form.notifyMinutesBefore.includes(m) ? 'tag-primary' : ''}`}
                style={{ cursor: 'pointer' }} onClick={() => {
                  setForm((f) => ({
                    ...f,
                    notifyMinutesBefore: f.notifyMinutesBefore.includes(m)
                      ? f.notifyMinutesBefore.filter((x) => x !== m)
                      : [...f.notifyMinutesBefore, m].sort((a, b) => b - a),
                  }))
                }}>
                {m === 0 ? '开抢时' : `${m}分钟前`}
              </span>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>{editing ? '保存' : '添加'}</button>
      </Modal>
      <ConfirmDialog open={deleteId !== null} title="删除" message="确定删除？" danger
        onConfirm={() => { if (deleteId) store.remove(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)} />
    </>
  )
}
