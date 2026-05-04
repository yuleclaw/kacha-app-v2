interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      className="toggle"
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        transition: 'background 0.2s',
        position: 'relative',
      }}
    >
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: 2,
        left: checked ? 22 : 2,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}
