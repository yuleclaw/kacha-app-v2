const STORAGE_PREFIX = 'kacha_'

/** 保存数据到 localStorage */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

/** 从 localStorage 加载数据 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 删除 storage 数据 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch { /* noop */ }
}

/** 导出所有数据为 JSON */
export function exportAllData(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) {
      try {
        result[key.slice(STORAGE_PREFIX.length)] = JSON.parse(localStorage.getItem(key) ?? 'null')
      } catch { /* skip */ }
    }
  }
  return result
}

/** 从 JSON 导入所有数据 */
export function importAllData(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    saveToStorage(key, value)
  }
}
