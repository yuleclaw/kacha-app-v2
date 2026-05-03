import React, { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import PageHeader from '@/components/PageHeader'

interface ScanPageProps {
  mode?: string
  onBack: () => void
  onRecognized: (type: string, data: Record<string, string>) => void
}

export default function ScanPage({ mode = 'auto', onBack, onRecognized }: ScanPageProps) {
  const { settings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState(mode === 'paste' ? 'paste' : mode)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Try local tesseract first, then fallback to cloud OCR
  const runOCR = async (imageData: string | Blob): Promise<string> => {
    setLoading(true)
    try {
      // Try local tesseract.js first
      const Tesseract = (await import('tesseract.js')).default
      const worker = await Tesseract.createWorker('chi_sim+eng', 1, {
        logger: m => console.log(m),
      })
      const { data } = await worker.recognize(imageData)
      await worker.terminate()
      setLoading(false)
      return data.text
    } catch (e) {
      console.log('Local OCR failed, trying cloud...', e)
      // Fallback to cloud OCR (RapidOCR server)
      if (settings.ocrServerUrl) {
        try {
          const formData = new FormData()
          if (typeof imageData === 'string') {
            const response = await fetch(imageData)
            const blob = await response.blob()
            formData.append('image', blob, 'scan.jpg')
          } else {
            formData.append('image', imageData, 'scan.jpg')
          }
          const res = await fetch(`${settings.ocrServerUrl}/ocr`, { method: 'POST', body: formData })
          const data = await res.json()
          setLoading(false)
          return data.text || ''
        } catch (e2) {
          console.error('Cloud OCR failed:', e2)
        }
      }
      setLoading(false)
      return 'OCR识别失败，请手动输入。'
    }
  }

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      stream.getTracks().forEach(t => t.stop())
      canvas.toBlob(async (blob) => {
        if (blob) { setImageSrc(URL.createObjectURL(blob)); const text = await runOCR(blob); setOcrText(text); parseAndFill(text) }
      }, 'image/jpeg', 0.9)
    } catch {
      // Fallback: use file input with camera capture
      fileInputRef.current?.setAttribute('capture', 'environment')
      fileInputRef.current?.click()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageSrc(URL.createObjectURL(file))
      runOCR(file).then(text => { setOcrText(text); parseAndFill(text) })
    }
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    if (text) {
      setOcrText(text)
      parseAndFill(text)
    }
  }

  const parseAndFill = (text: string) => {
    // Simple rule-based parser
    const data: Record<string, string> = { raw: text }
    const lower = text.toLowerCase()

    // Detect type
    if (lower.includes('券') || lower.includes('优惠') || lower.includes('折扣') || lower.includes('满减')) {
      data.type = 'coupon'
    } else if (lower.includes('秒杀') || lower.includes('限时') || lower.includes('特价')) {
      data.type = 'flash'
    } else if (lower.includes('日程') || lower.includes('会议') || lower.includes('活动')) {
      data.type = 'schedule'
    } else if (lower.includes('旅行') || lower.includes('行程') || lower.includes('航班')) {
      data.type = 'travel'
    } else if (lower.includes('保修')) {
      data.type = 'warranty'
    } else if (lower.includes('纪念') || lower.includes('生日') || lower.includes('周年')) {
      data.type = 'anniversary'
    }

    setResult(data)
  }

  const handleConfirm = () => {
    if (result && result.type && onRecognized) {
      onRecognized(result.type, result)
    }
  }

  useEffect(() => {
    if (mode === 'paste') {
      handlePaste()
    }
  }, [mode])

  return (
    <div className="app-container">
      <PageHeader title="扫描识别" onBack={onBack} />

      <input
        ref={fileInputRef}
        type="file" accept="image/*" style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="page">
        {/* Tab selector */}
        <div style={{ display: 'flex', background: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
          {[
            { key: 'auto', label: '🤖 自动' },
            { key: 'coupon', label: '🎫 优惠券' },
            { key: 'flash', label: '⚡ 秒杀' },
            { key: 'schedule', label: '📅 日程' },
            { key: 'travel', label: '✈️ 行程' },
            { key: 'warranty', label: '🔧 保修' },
            { key: 'anniversary', label: '💜 纪念日' },
            { key: 'paste', label: '📋 粘贴' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                if (tab.key === 'paste') handlePaste()
              }}
              style={{
                flex: 1, padding: '10px 0', fontSize: 'var(--font-xs)',
                background: activeTab === tab.key ? 'var(--color-primary)18' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Camera / Upload */}
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          {!imageSrc && activeTab !== 'paste' && (
            <div>
              <div
                onClick={handleCamera}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', margin: '0 auto var(--spacing-md)',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(127,119,221,0.4)',
                }}
              >
                📸
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                点击拍照或选择图片
              </div>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                从相册选择
              </button>
            </div>
          )}

          {imageSrc && (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <img src={imageSrc} style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', maxHeight: '200px', objectFit: 'cover' }} />
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--spacing-sm)' }} onClick={() => { setImageSrc(null); setOcrText(''); setResult(null) }}>重新拍照</button>
            </div>
          )}

          {loading && (
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: 'var(--font-md)', color: 'var(--color-primary)' }}>正在识别中...</div>
            </div>
          )}

          {ocrText && !loading && (
            <div style={{ textAlign: 'left', marginTop: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>识别结果：</div>
              <div style={{
                background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)', fontSize: 'var(--font-sm)',
                whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto',
              }}>
                {ocrText}
              </div>

              {result && result.type && (
                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-success)', marginBottom: 'var(--spacing-sm)' }}>
                    已识别为：{result.type === 'coupon' ? '优惠券' : result.type === 'flash' ? '秒杀' : result.type === 'schedule' ? '日程' : result.type === 'travel' ? '旅行' : result.type === 'warranty' ? '保修' : '纪念日'}
                  </div>
                  <button className="btn btn-primary" onClick={handleConfirm}>
                    确认并跳转到录入页
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
