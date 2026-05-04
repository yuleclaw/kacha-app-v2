import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  right?: ReactNode
}

export default function PageHeader({ title, onBack, right }: PageHeaderProps) {
  return (
    <div className="page-header">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ‹
        </button>
      )}
      <h1>{title}</h1>
      {right && <div>{right}</div>}
    </div>
  )
}
