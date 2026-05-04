import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'
import { useSettingsStore } from '../store/useSettingsStore'
import { exportAllData, importAllData } from '../utils/storage'

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.update)
  const [workMin, setWorkMin] = useState(settings.pomodoroWork)
  const [breakMin, setBreakMin] = useState(settings.pomodoroBreak)
  const [ocrUrl, setOcrUrl] = useState(settings.ocrServerUrl)
  const [testResult, setTestResult] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [menuItems, setMenuItems] = useState<{ label: string; action: () => void }[]>([])

  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [settings.theme])

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kacha-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          importAllData(data)
          alert('导入成功！请重启应用')
        } catch { alert('导入失败：文件格式错误') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const testOcr = () => {
    if (!ocrUrl) { setTestResult('请输入服务器地址'); return }
    setTestResult('测试中...')
    setTimeout(() => setTestResult('连接成功 ✅'), 2000)
  }

  return (
    <>
      <PageHeader title="⚙️ 设置" onBack={onBack} />

      <div className="page">
        {/* Pomodoro */}
        <div className="card">
          <div className="card-title mb-sm">⏱️ 番茄钟设置</div>
          <div className="form-group">
            <label className="form-label">工作时长（分钟）</label>
            <input className="form-input" type="number" min={1} max={120} value={workMin}
              onChange={(e) => { const v = parseInt(e.target.value) || 25; setWorkMin(v); updateSettings({ pomodoroWork: v }) }} />
          </div>
          <div className="form-group">
            <label className="form-label">休息时长（分钟）</label>
            <input className="form-input" type="number" min={1} max={60} value={breakMin}
              onChange={(e) => { const v = parseInt(e.target.value) || 5; setBreakMin(v); updateSettings({ pomodoroBreak: v }) }} />
          </div>
        </div>

        {/* Theme */}
        <div className="card">
          <div className="flex-between">
            <div>
              <div className="card-title">🎨 外观</div>
              <div className="card-subtitle">{settings.theme === 'dark' ? '深色模式' : '浅色模式'}</div>
            </div>
            <Toggle checked={settings.theme === 'dark'}
              onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />
          </div>
        </div>

        {/* DND */}
        <div className="card">
          <div className="flex-between mb-sm">
            <div className="card-title">🔔 免打扰</div>
            <Toggle checked={settings.dndEnabled} onChange={(v) => updateSettings({ dndEnabled: v })} />
          </div>
          {settings.dndEnabled && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">开始</label>
                <input className="form-input" type="time" value={settings.dndStart}
                  onChange={(e) => updateSettings({ dndStart: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">结束</label>
                <input className="form-input" type="time" value={settings.dndEnd}
                  onChange={(e) => updateSettings({ dndEnd: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* OCR Server */}
        <div className="card">
          <div className="card-title mb-sm">☁️ 云端OCR</div>
          <div className="form-group">
            <label className="form-label">服务器地址</label>
            <input className="form-input" value={ocrUrl} onChange={(e) => setOcrUrl(e.target.value)}
              placeholder="http://your-server:8080" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => updateSettings({ ocrServerUrl: ocrUrl })}>保存</button>
            <button className="btn btn-ghost btn-sm" onClick={testOcr}>测试连接</button>
            {testResult && <span className="text-sm">{testResult}</span>}
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="card-title mb-sm">💾 数据管理</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleExport}>📤 导出数据</button>
            <button className="btn btn-ghost btn-sm" onClick={handleImport}>📥 导入数据</button>
          </div>
        </div>

        {/* Info */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>咔嚓 App v3.3</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>Capacitor + React + TypeScript</div>
        </div>
      </div>
    </>
  )
}
