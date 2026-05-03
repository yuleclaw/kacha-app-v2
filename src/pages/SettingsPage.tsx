import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAnniversaryStore, useFlashStore, useExpiryStore, useCouponStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import Toggle from '@/components/Toggle'
import { exportAllData, importAllData, clearAllData } from '@/utils/storage'

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, load, update, toggleTheme } = useSettingsStore()
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [ocrTestResult, setOcrTestResult] = useState('')

  useEffect(() => { load() }, [])

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kacha-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          const ok = importAllData(reader.result as string)
          alert(ok ? '导入成功！已重新加载数据。' : '导入失败，请检查文件格式。')
          if (ok) window.location.reload()
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const testOcrServer = async () => {
    if (!settings.ocrServerUrl) { alert('请先配置OCR服务器地址'); return }
    try {
      const res = await fetch(settings.ocrServerUrl)
      setOcrTestResult(res.ok ? '✅ 连接成功' : `❌ 连接失败: ${res.statusText}`)
    } catch (e: any) {
      setOcrTestResult(`❌ 连接失败: ${e.message}`)
    }
  }

  return (
    <div className="app-container">
      <PageHeader title="设置" onBack={onBack} />
      <div className="page">

        {/* Pomodoro Settings */}
        <div className="card">
          <div className="card-title">🍅 番茄钟设置</div>
          <div className="form-row" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">工作时间(分钟)</label>
              <input className="form-input" type="number" value={settings.pomodoroWork}
                onChange={e => update({ pomodoroWork: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">休息时间(分钟)</label>
              <input className="form-input" type="number" value={settings.pomodoroBreak}
                onChange={e => update({ pomodoroBreak: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="card">
          <div className="card-title">🎨 外观</div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: settings.theme === 'light' ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                color: settings.theme === 'light' ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              浅色模式
            </button>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: settings.theme === 'dark' ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                color: settings.theme === 'dark' ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              深色模式
            </button>
          </div>
        </div>

        {/* DND */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-md)' }}>🔔 免打扰</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                时间段：{settings.dndStart} ~ {settings.dndEnd}
              </div>
            </div>
            <Toggle active={settings.dndEnabled} onChange={(v: boolean) => update({ dndEnabled: v })} />
          </div>
          {settings.dndEnabled && (
            <div className="form-row" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">开始</label>
                <input className="form-input" type="time" value={settings.dndStart}
                  onChange={e => update({ dndStart: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">结束</label>
                <input className="form-input" type="time" value={settings.dndEnd}
                  onChange={e => update({ dndEnd: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* Cloud OCR */}
        <div className="card">
          <div className="card-title">☁️ 云端OCR配置</div>
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">服务器地址</label>
            <div className="flex gap-sm">
              <input className="form-input" value={settings.ocrServerUrl}
                onChange={e => update({ ocrServerUrl: e.target.value })}
                placeholder="https://your-ocr-server.com" style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" onClick={testOcrServer}>测试</button>
            </div>
          </div>
          {ocrTestResult && (
            <div style={{ fontSize: 'var(--font-sm)', marginTop: 'var(--spacing-sm)', color: ocrTestResult.includes('✅') ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {ocrTestResult}
            </div>
          )}
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
            留空则只使用本地OCR（tesseract.js）
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="card-title">💾 数据管理</div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExport}>导出数据</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleImport}>导入数据</button>
          </div>
          <button className="btn btn-danger" style={{ width: '100%', marginTop: 'var(--spacing-lg)' }} onClick={() => setShowConfirmClear(true)}>
            清除所有数据
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
          咔嚓 App v3.3
        </div>
      </div>

      {showConfirmClear && (
        <div className="confirm-dialog" onClick={() => setShowConfirmClear(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">清除所有数据</div>
            <div className="confirm-message">确定要清除所有数据吗？此操作不可恢复！</div>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirmClear(false)}>取消</button>
              <button className="btn btn-danger" onClick={() => { clearAllData(); setShowConfirmClear(false); alert('所有数据已清除\n请重启应用。') }}>确认清除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
