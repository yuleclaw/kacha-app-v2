import React, { useState, useEffect } from 'react'
import { useFlashStore } from '@/store/useFlashStore'
import { FlashSale, PLATFORM_LABELS } from '@/types'
import { formatFlashCountdown, formatDateTime, generateId } from '@/utils/date'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import Toggle from '@/components/Toggle'
import ConfirmDialog from '@/components/ConfirmDialog'

interface FlashPageProps {
  onBack: () => void
}

export default function FlashPage({ onBack }: FlashPageProps) {
  const { items, load, add, update, remove, toggleNotify } = useFlashStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<FlashSale | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [productName, setProductName] = useState('')
  const [platform, setPlatform] = useState<FlashSale['platform']>('jd')
  const [originalPrice, setOriginalPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [startTime, setStartTime] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [countdown, setCountdown] = useState<Record<string, ReturnType<typeof formatFlashCountdown>>>({})

  useEffect(() => { load() }, [])

  // Update countdown every second
  useEffect(() => {
    const update = () => {
      const map: Record<string, ReturnType<typeof formatFlashCountdown>> = {}
      items.forEach(item => {
        map[item.id] = formatFlashCountdown(item.startTime)
      })
      setCountdown(map)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [items])

  const sortedItems = [...items].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const openAdd = () => {
    setEditItem(null)
    setProductName(''); setPlatform('jd'); setOriginalPrice('')
    setSalePrice(''); setStartTime(''); setProductUrl('')
    setNotifyEnabled(true); setShowModal(true)
  }

  const openEdit = (item: FlashSale) => {
    setEditItem(item)
    setProductName(item.productName); setPlatform(item.platform)
    setOriginalPrice(item.originalPrice); setSalePrice(item.salePrice)
    setStartTime(item.startTime); setProductUrl(item.productUrl)
    setNotifyEnabled(item.notifyEnabled); setShowModal(true)
  }

  const handleSave = () => {
    if (!productName.trim() || !salePrice || !startTime) return
    const data = { productName: productName.trim(), platform, originalPrice, salePrice, startTime, productUrl, notifyEnabled, notifyMinutesBefore: [60, 10, 1, 0] }
    if (editItem) {
      update(editItem.id, data)
    } else {
      add(data)
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (deleteId) { remove(deleteId); setDeleteId(null) }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('链接已复制')
    } catch {
      window.prompt('复制链接:', url)
    }
  }

  return (
    <div className="app-container">
      <PageHeader
        title="秒杀管理"
        onBack={onBack}
        rightAction={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ 添加</button>}
      />
      <div className="page">
        {sortedItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚡</div>
            <div className="empty-state-text">暂无秒杀活动</div>
          </div>
        ) : (
          sortedItems.map(item => {
            const cd = countdown[item.id]
            return (
              <div key={item.id} className="card" onClick={() => openEdit(item)} style={{ cursor: 'pointer' }}>
                <div className="flex items-center justify-between mb-sm">
                  <span className="tag tag-danger">{PLATFORM_LABELS[item.platform]}</span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
                    {formatDateTime(item.startTime)}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)' }} className="truncate">{item.productName}</div>
                <div className="flex items-center gap-sm mt-sm">
                  <span className="text-secondary" style={{ fontSize: 'var(--font-sm)' }}>¥{item.originalPrice}</span>
                  <span className="text-danger" style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>¥{item.salePrice}</span>
                </div>
                {cd && (
                  <div className="flex items-center gap-md mt-md">
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {cd.days > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ background: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                            {String(cd.days).padStart(2, '0')}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>天</div>
                        </div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ background: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                          {String(cd.hours).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>时</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ background: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                          {String(cd.minutes).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>分</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }} />
                    {item.productUrl && (
                      <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); copyLink(item.productUrl) }}>
                        🔗 链接
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}>
                      删除
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑秒杀' : '添加秒杀'}>
        <div className="form-group">
          <label className="form-label">商品名称</label>
          <input className="form-input" value={productName} onChange={e => setProductName(e.target.value)} placeholder="商品名称" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">平台</label>
            <select className="form-select" value={platform} onChange={e => setPlatform(e.target.value as FlashSale['platform'])}>
              {Object.entries(PLATFORM_LABELS).filter(([k]) => ['jd', 'taobao', 'pinduoduo', 'dewu'].includes(k)).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">开始时间</label>
            <input className="form-input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">原价</label>
            <input className="form-input" type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="原价" />
          </div>
          <div className="form-group">
            <label className="form-label">秒杀价</label>
            <input className="form-input" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="秒杀价" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">商品链接</label>
          <input className="form-input" value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="商品链接（可选）" />
        </div>
        <div className="flex items-center gap-sm" style={{ padding: 'var(--spacing-sm) 0' }}>
          <Toggle active={notifyEnabled} onChange={setNotifyEnabled} />
          <span style={{ fontSize: 'var(--font-sm)' }}>开启提醒（60/10/1/0分钟）</span>
        </div>
        <div style={{ padding: 'var(--spacing-lg) 0' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {editItem ? '保存' : '添加'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="删除秒杀" message="确定要删除这个秒杀活动吗？" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
