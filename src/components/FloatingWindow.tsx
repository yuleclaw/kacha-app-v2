/**
 * 悬浮窗组件
 * 
 * 注意：真正的悬浮窗需要 Android 原生 WindowManager 实现
 * 这里提供 UI 控制界面，原生部分通过 Capacitor plugin 桥接
 * 
 * 悬浮窗模式:
 * 0 = 时钟
 * 1 = 倒计时
 * 2 = 秒表
 */

interface FloatingWindowProps {
  mode: number // 0=时钟 1=倒计时 2=秒表
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onModeChange?: (mode: number) => void
}

const MODE_LABELS = ['时钟', '倒计时', '秒表']

export default function FloatingWindow({ mode, enabled, onToggle, onModeChange }: FloatingWindowProps) {
  // UI controls for floating window settings
  // Actual WindowManager implementation requires native Android code

  return (
    <div className="card">
      <div className="flex-between mb-sm">
        <div>
          <div className="card-title">悬浮窗</div>
          <div className="card-subtitle">
            {enabled ? `已开启 - ${MODE_LABELS[mode] ?? '时钟'}模式` : '已关闭'}
          </div>
        </div>
        <label className="toggle-label">
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)}
            style={{ width: 48, height: 28 }} />
        </label>
      </div>
      {enabled && (
        <div style={{ display: 'flex', gap: 6 }}>
          {MODE_LABELS.map((label, i) => (
            <span key={i}
              className={`tag ${mode === i ? 'tag-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onModeChange?.(i)}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
