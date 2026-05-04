import { Solar, Lunar as LunarCalendar } from 'lunar-javascript'

export interface LunarInfo {
  year: string
  month: string
  day: string
  full: string
}

/** 获取指定日期的农历信息 */
export function getLunarInfo(dateStr: string): LunarInfo | null {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const solar = Solar.fromDate(d)
    const lunar = solar.getLunar()
    return {
      year: lunar.getYearInChinese(),
      month: lunar.getMonthInChinese(),
      day: lunar.getDayInChinese(),
      full: lunar.toFullString(),
    }
  } catch {
    return null
  }
}

/** 根据农历获取下一次公历日期 */
export function getNextSolarDate(lunarMonth: number, lunarDay: number): string {
  const now = new Date()
  const year = now.getFullYear()
  try {
    const lunar = LunarCalendar.fromYmd(year, lunarMonth, lunarDay)
    const solar = lunar.getSolar()
    const dateStr = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
    const d = new Date(dateStr)
    if (d < now) {
      // 如果已过，取明年
      const nextLunar = LunarCalendar.fromYmd(year + 1, lunarMonth, lunarDay)
      const nextSolar = nextLunar.getSolar()
      return `${nextSolar.getYear()}-${String(nextSolar.getMonth()).padStart(2, '0')}-${String(nextSolar.getDay()).padStart(2, '0')}`
    }
    return dateStr
  } catch {
    return ''
  }
}
