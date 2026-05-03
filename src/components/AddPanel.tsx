import React, { useState, useRef, useCallback } from 'react'
import { useAnniversaryStore } from '@/store/useAnniversaryStore'
import { useExpiryStore } from '@/store/useExpiryStore'
import { useWarrantyStore } from '@/store/useWarrantyStore'
import { useCouponStore } from '@/store/useCouponStore'
import { useFlashStore } from '@/store/useFlashStore'
import { useScheduleStore } from '@/store/useScheduleStore'
import { useTravelStore } from '@/store/useTravelStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { UniversalAddType } from '@/types'

interface AddPanelProps {
  open: boolean
  onClose: () => void
  onNavigate: (type: string, mode?: string) => void
  onScan: () => void
}

const ADD_ITEMS: { type: UniversalAddType | 'scan' | 'paste'; icon: string; label: string; color: string; bgColor: string }[] = [
  { type: 'scan', icon: '📸', label: '拍照识别', color: '#007AFF', bgColor: '#E5F1FF' },
  { type: 'paste', icon: '📋', label: '粘贴识别', color: '#5856D6', bgColor: '#EEEDFE' },
  { type: 'anniversary', icon: '💜', label: '纪念日', color: '#FF2D55', bgColor: '#FBEAF0' },
  { type: 'expiry', icon: '📦', label: '保质期', color: '#FF9500', bgColor: '#FFF3E0' },
  { type: 'warranty', icon: '🔧', label: '保修期', color: '#007AFF', bgColor: '#E5F1FF' },
  { type: 'coupon', icon: '🎫', label: '优惠券', color: '#5856D6', bgColor: '#EEEDFE' },
  { type: 'flash', icon: '⚡', label: '秒杀', color: '#FF3B30', bgColor: '#FFEBEA' },
  { type: 'schedule', icon: '📅', label: '日程', color: '#34C759', bgColor: '#E8F8ED' },
  { type: 'travel', icon: '✈️', label: '旅行', color: '#00C7BE', bgColor: '#E0F7F5' },
  { type: 'expense', icon: '💰', label: '报销', color: '#FF9500', bgColor: '#FFF3E0' },
]

export default function AddPanel({ open, onClose, onNavigate, onScan }: AddPanelProps) {
  if (!open) return null

  const handleItemClick = (type: string) => {
    onClose()
    if (type === 'scan') {
      onScan()
    } else if (type === 'paste') {
      const text = window.prompt('粘贴内容:')
      if (text) {
        onNavigate('scan', 'paste')
      }
    } else {
      onNavigate(type, 'add')
    }
  }

  return (
    <>
      <div className="add-panel-overlay" onClick={onClose} />
      <div className="add-panel">
        {ADD_ITEMS.map(item => (
          <div
            key={item.type}
            className="add-panel-item"
            onClick={() => handleItemClick(item.type)}
          >
            <div
              className="add-panel-icon"
              style={{ background: item.bgColor, fontSize: '18px' }}
            >
              {item.icon}
            </div>
            <span style={{ fontSize: 'var(--font-md)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}
