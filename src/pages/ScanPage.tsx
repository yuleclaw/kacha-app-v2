import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import type { PageName } from '../types'

interface ScanPageProps {
  mode: string
  onBack: () => void
  onRecognized: (type: PageName) => void
}

const SCAN_MODES = [
  { key: 'auto', label: '自动', icon: '🤖' },
  { key: 'coupon', label: '优惠券', icon: '🎫' },
  { key: 'flash', label: '秒杀', icon: '⚡' },
  { key: 'schedule', label: '日程', icon: '📅' },
  { key: 'travel', label: '行程', icon: '✈️' },
  { key: 'warranty', label: '保修', icon: '🔧' },
  { key: 'anniversary', label: '纪念日', icon: '💜' },
]

export default function ScanPage({ mode, onBack, onRecognized }: ScanPageProps) {
  const [currentMode, setCurrentMode] = useState(mode || 'auto')
  const [scanResult, setScanResult] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    // In a real app, this would call the Capacitor Camera API
    // For now, simulate with a text input
    setTimeout(() => {
      setIsScanning(false)
    }, 1500)
  }

  const handleRecognize = () => {
    if (!scanResult.trim()) return
    // Parse text and navigate
    const text = scanResult.toLowerCase()
    if (text.includes('券') || text.includes('优惠') || text.includes('折扣')) {
      onRecognized('coupon')
    } else if (text.includes('秒杀') || text.includes('抢购') || text.includes('闪购')) {
      onRecognized('flash')
    } else if (text.includes('日程') || text.includes('会议') || text.includes('预约')) {
      onRecognized('schedule')
    } else if (text.includes('旅行') || text.includes('行程') || text.includes('航班')) {
      onRecognized('travel')
    } else if (text.includes('保') || text.includes('维修') || text.includes('售后')) {
      onRecognized('warranty')
    } else if (text.includes('纪念') || text.includes('生日') || text.includes('周年')) {
      onRecognized('anniversary')
    } else {
      alert('无法识别类型，请手动选择')
    }
  }

  return (
    <>
      <PageHeader title="📸 扫描识别" onBack={onBack} />

      <div className="page">
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          {SCAN_MODES.map((m) => (
            <span key={m.key} className={`tag ${currentMode === m.key ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer', fontSize: 13, padding: '4px 10px' }}
              onClick={() => setCurrentMode(m.key)}>
              {m.icon} {m.label}
            </span>
          ))}
        </div>

        {/* Camera / Image area */}
        <div className="card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)' }}>
          {isScanning ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>识别中...</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
              <div className="btn-group" style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={handleScan}>拍照识别</button>
                <button className="btn btn-ghost" onClick={handleScan}>从相册选择</button>
              </div>
            </div>
          )}
        </div>

        {/* Manual text input */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label className="form-label">或粘贴文本识别</label>
            <textarea className="form-textarea" rows={4}
              value={scanResult} onChange={(e) => setScanResult(e.target.value)}
              placeholder="粘贴扫描识别的文本，或手动输入商品信息..." />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRecognize}
            disabled={!scanResult.trim()}>
            识别并跳转
          </button>
        </div>

        {/* Recognized results display */}
        {scanResult && (
          <div className="card">
            <div className="card-title">识别结果</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{scanResult}</div>
          </div>
        )}
      </div>
    </>
  )
}
