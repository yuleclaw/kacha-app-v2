import React from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        {title && (
          <div style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
