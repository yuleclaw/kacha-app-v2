import { Solar, Lunar as LunarCalendar } from 'lunar-javascript'
import {
  format, differenceInDays, differenceInMinutes,
  isToday, isPast, parseISO, addDays, startOfDay,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

/** 格式化显示日期 */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd')
  } catch { return dateStr }
}

/** 格式化显示时间 */
export function formatTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'HH:mm')
  } catch { return dateStr }
}

/** 格式化显示日期时间 */
export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd HH:mm')
  } catch { return dateStr }
}

/** 获取距离今天的天数（正=未来，负=已过） */
export function daysFromToday(dateStr: string): number {
  try {
    const target = startOfDay(parseISO(dateStr))
    const today = startOfDay(new Date())
    return differenceInDays(target, today)
  } catch { return 0 }
}

/** 是否即将过期（N天内） */
export function isExpiringSoon(dateStr: string, days: number): boolean {
  const d = daysFromToday(dateStr)
  return d >= 0 && d <= days
}

/** 是否已过期 */
export function isExpired(dateStr: string): boolean {
  const d = daysFromToday(dateStr)
  return d < 0
}

/** 是否今天 */
export function isTodayDate(dateStr: string): boolean {
  try { return isToday(parseISO(dateStr)) }
  catch { return false }
}

/** 获取农历日期中文描述 */
export function getLunarDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    const solar = Solar.fromDate(d)
    const lunar = solar.getLunar()
    return `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
  } catch {
    return ''
  }
}

/** 获取农历月日（如"腊月廿三"） */
export function getLunarMonthDay(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    const solar = Solar.fromDate(d)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
  } catch {
    return ''
  }
}

/** 获取下一年的农历同一天 */
export function getNextLunarDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    const solar = Solar.fromDate(d)
    const lunar = solar.getLunar()
    const nextLunar = LunarCalendar.fromYmd(lunar.getYear() + 1, Math.abs(lunar.getMonth()), lunar.getDay())
    const nextSolar = nextLunar.getSolar()
    return `${nextSolar.getYear()}-${String(nextSolar.getMonth()).padStart(2, '0')}-${String(nextSolar.getDay()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

/** 获取下一次日期（农历或公历） */
export function getNextOccurrence(dateStr: string, lunar: boolean): string {
  if (!lunar) {
    const d = parseISO(dateStr)
    const thisYear = format(d, 'MM-dd')
    const now = new Date()
    const year = now.getFullYear()
    // 避免闰年2月29日问题：如果今年不是闰年但日期是02-29，跳到明年
    let thisYearDate: Date
    if (thisYear === '02-29') {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
      if (!isLeap) {
        const nextLeapYear = year + 4 - (year % 4)
        thisYearDate = parseISO(`${nextLeapYear}-02-29`)
        if (isPast(thisYearDate) && !isToday(thisYearDate)) {
          return `${nextLeapYear + 4}-02-29`
        }
        return `${nextLeapYear}-02-29`
      }
    }
    thisYearDate = parseISO(`${year}-${thisYear}`)
    if (isPast(thisYearDate) && !isToday(thisYearDate)) {
      return `${year + 1}-${thisYear}`
    }
    return `${year}-${thisYear}`
  }
  return getNextLunarDate(dateStr)
}

/** 格式化倒计时文字 */
export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return '已开始'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}小时${m}分`
  return `${m}分钟`
}

/** 判断闪购是否即将开始 */
export function isFlashSoon(startTime: string): boolean {
  try {
    const diff = differenceInMinutes(parseISO(startTime), new Date())
    return diff > 0 && diff <= 60
  } catch { return false }
}

/** 计算倒计时文字 */
export function getCountdownText(startTime: string): string {
  try {
    const diff = differenceInMinutes(parseISO(startTime), new Date())
    return formatCountdown(diff)
  } catch { return '' }
}

/** 日期间隔文字 */
export function daysLabel(days: number): string {
  if (days === 0) return '今天'
  if (days > 0) return `剩余 ${days} 天`
  return `已过 ${Math.abs(days)} 天`
}
