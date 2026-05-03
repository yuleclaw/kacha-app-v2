import React from 'react'

interface ToggleProps {
  active: boolean
  onChange: (value: boolean) => void
}

export default function Toggle({ active, onChange }: ToggleProps) {
  return (
    <div
      className={`toggle ${active ? 'active' : ''}`}
      onClick={() => onChange(!active)}
    />
  )
}
