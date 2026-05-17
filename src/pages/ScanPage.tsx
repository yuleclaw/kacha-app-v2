import { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import { recognizeImage, guessOcrType } from '../utils/ocr'
import { useSettingsStore } from '../store/useSettingsStore'
import type { PageName } from '../types'

interface ScanPageProps { mode: string; onBack: () => void; onRecognized: (type: PageName) => void }

const SCAN_MODES = [
  { key: 'auto', label: '\u81ea\u52a8', icon: '\u{1f916}' },
  { key: 'coupon', label: '\u4f18\u60e0\u5238', icon: '\u{1f3ab}' },
  { key: 'flash', label: '\u79d2\u6740', icon: '\u26a1' },
  { key: 'schedule', label: '\u65e5\u7a0b', icon: '\u{1f4c5}' },
  { key: 'travel', label: '\u884c\u7a0b', icon: '\u2708\ufe0f' },
  { key: 'expiry', label: '\u4fdd\u4fee', icon: '\u{1f527}' },
  { key: 'anniversary', label: '\u7eaa\u5ff5\u65e5', icon: '\u{1f49c}' },
]

export default function ScanPage({ mode, onBack, onRecognized }: ScanPageProps) {
  const [currentMode, setCurrentMode] = useState(mode || 'auto')
  const [result, setResult] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [ocrSource, setOcrSource] = useState<'local' | 'cloud' | ''>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const cloudOcrUrl = useSettingsStore((s) => s.settings.ocrServerUrl)

  const handleImage = async (file: File) => {
    setIsScanning(true)
    setProgress(0)
    setStatusText('\u8bc6\u522b\u4e2d...')
    setOcrSource('')
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    try {
      const ocrResult = await recognizeImage(file, undefined, cloudOcrUrl || undefined)
      if (ocrResult.text) {
        setResult(ocrResult.text)
        setOcrSource(ocrResult.source)
        setStatusText(ocrResult.source === 'local' ? '\u672c\u5730\u8bc6\u522b\u5b8c\u6210' : '\u4e91\u7aef\u8bc6\u522b\u5b8c\u6210')
        setProgress(100)
        if (currentMode !== 'auto') { onRecognized(currentMode as PageName) }
        else if (ocrResult.type !== 'unknown') { onRecognized(ocrResult.type as PageName) }
      } else { setStatusText('\u672a\u8bc6\u522b\u5230\u6587\u5b57'); setProgress(100) }
    } catch (err) {
      console.error('OCR error:', err)
      setResult('\u8bc6\u522b\u5931\u8d25')
      setStatusText('\u8bc6\u522b\u51fa\u9519')
    } finally { setIsScanning(false) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleImage(file)
    e.target.value = ''
  }

  const handlePaste = () => {
    if (!result.trim()) return
    const guessed = guessOcrType(result)
    const target = currentMode !== 'auto' ? currentMode : (guessed !== 'unknown' ? guessed : 'auto')
    if (target !== 'auto') { onRecognized(target as PageName) }
    else { alert('\u672a\u80fd\u8bc6\u522b\u7c7b\u578b') }
  }

  return (
    <>
      <PageHeader title="Scan / OCR" onBack={onBack} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileSelect} />
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      <div className="page">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
          {SCAN_MODES.map((m) => (
            <span key={m.key} className={'tag ' + (currentMode === m.key ? 'tag-primary' : '')}
              style={{ cursor: 'pointer', fontSize: 13, padding: '4px 10px', whiteSpace: 'nowrap' }}
              onClick={() => setCurrentMode(m.key)}>{m.icon} {m.label}</span>
          ))}
        </div>
        <div className="card" style={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
          {previewUrl && !isScanning && (
            <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, marginBottom: 8 }} />
          )}
          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{'\u{1f50d}'}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{statusText}</div>
              <div style={{ width: 200, height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ width: Math.max(5, progress * 100) + '%', height: '100%', background: 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>{'\u{1f4f7}'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>Take photo or select from gallery</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => cameraInputRef.current?.click()}>Camera</button>
                <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>Gallery</button>
              </div>
            </div>
          )}
        </div>
        {result && (
          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="card-title">Result</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{statusText}{ocrSource && <span className={'tag ' + (ocrSource === 'local' ? 'tag-success' : 'tag-warning')}>{ocrSource === 'local' ? 'local' : 'cloud'}</span>}</span>
            </div>
            <textarea className="form-textarea" rows={5} value={result} onChange={(e) => setResult(e.target.value)} style={{ fontSize: 12 }} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handlePaste}>
              {currentMode !== 'auto' ? 'Go' : 'Auto classify'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
