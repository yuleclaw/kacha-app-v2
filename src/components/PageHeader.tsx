import React from 'react'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  rightAction?: React.ReactNode
}

export default function PageHeader({ title, onBack, rightAction }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        {onBack && (
          <button className="header-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <span className="page-header-title">{title}</span>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  )
}
