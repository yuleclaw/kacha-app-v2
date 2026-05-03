import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format, isBefore, isAfter, parseISO, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatCountdown(targetDate: string): string {
  const now = new Date()
  const target = parseISO(targetDate)
  const days = differenceInDays(target, now)

  if (days > 0) return `${days}天`
  if (days === 0) return '今天'
  return `已过${Math.abs(days)}天`
}

export function formatCountdownDetailed(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date()
  const target = parseISO(targetDate)
  const isPast = isBefore(target, now)

  const absDiff = Math.abs(differenceInSeconds(target, now))
  const days = Math.floor(absDiff / 86400)
  const hours = Math.floor((absDiff % 86400) / 3600)
  const minutes = Math.floor((absDiff % 3600) / 60)
  const seconds = absDiff % 60

  return { days, hours, minutes, seconds, isPast }
}

export function formatFlashCountdown(startTime: string): { days: number; hours: number; minutes: number; totalMinutes: number; isStarted: boolean } {
  const now = new Date()
  const start = parseISO(startTime)
  const isStarted = isAfter(now, start)
  const totalMinutes = differenceInMinutes(start, now)

  const absMinutes = Math.abs(totalMinutes)
  const days = Math.floor(absMinutes / 1440)
  const hours = Math.floor((absMinutes % 1440) / 60)
  const minutes = absMinutes % 60

  return { days, hours, minutes, totalMinutes, isStarted }
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'yyyy年M月d日', { locale: zhCN })
}

export function formatDateTime(date: string): string {
  return format(parseISO(date), 'yyyy-MM-dd HH:mm', { locale: zhCN })
}

export function formatTime(date: string): string {
  return format(parseISO(date), 'HH:mm')
}

export function isToday(date: string): boolean {
  const target = startOfDay(parseISO(date))
  const today = startOfDay(new Date())
  return target.getTime() === today.getTime()
}

export function isThisWeek(date: string): boolean {
  const now = new Date()
  const target = parseISO(date)
  const diff = differenceInDays(target, now)
  return diff >= 0 && diff <= 7
}

export function isThisMonth(date: string): boolean {
  const now = new Date()
  const target = parseISO(date)
  return now.getMonth() === target.getMonth() && now.getFullYear() === target.getFullYear()
}

export function daysUntil(date: string): number {
  return differenceInDays(parseISO(date), new Date())
}

export function isExpiringSoon(date: string, daysBefore: number): boolean {
  const diff = daysUntil(date)
  return diff >= 0 && diff <= daysBefore
}

export function isExpired(date: string): boolean {
  return isBefore(parseISO(date), new Date())
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
