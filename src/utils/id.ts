/**
 * 通用 ID 生成器
 * 使用时间戳+随机数，确保唯一性
 */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
