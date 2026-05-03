export const STORAGE_KEYS = {
  ANNIVERSARIES: 'kacha_anniversaries',
  FLASH_SALES: 'kacha_flash_sales',
  EXPIRY_ITEMS: 'kacha_expiry_items',
  WARRANTIES: 'kacha_warranties',
  COUPONS: 'kacha_coupons',
  EXPENSES: 'kacha_expenses',
  SCHEDULES: 'kacha_schedules',
  TRAVELS: 'kacha_travels',
  SETTINGS: 'kacha_settings',
  POMODORO: 'kacha_pomodoro',
} as const

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  Object.values(STORAGE_KEYS).forEach(key => {
    const stored = localStorage.getItem(key)
    if (stored) data[key] = JSON.parse(stored)
  })
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr)
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
    return true
  } catch {
    return false
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}
