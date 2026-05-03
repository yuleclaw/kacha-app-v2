import { Solar } from 'lunar-javascript'

export function toLunarDate(dateStr: string): { year: string; month: string; day: string; animal: string; ganZhiYear: string; festival: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()

  return {
    year: `${lunar.getYearInChinese()}年`,
    month: lunar.getMonthInChinese() + '月',
    day: lunar.getDayInChinese(),
    animal: lunar.getYearShengXiao(),
    ganZhiYear: `${lunar.getYearInGanZhi()}年`,
    festival: lunar.getFestivals()?.[0] || '',
  }
}

export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false): string {
  const lunar = Lunar.fromYmd(year, month, day, isLeapMonth)
  const solar = lunar.getSolar()
  return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
}

export function getNextLunarDate(lunarMonth: number, lunarDay: number): string {
  const today = new Date()
  const solar = Solar.fromDate(today)
  let lunar = solar.getLunar()

  let year = lunar.getYear()
  if (lunar.getMonth() > lunarMonth || (lunar.getMonth() === lunarMonth && lunar.getDay() >= lunarDay)) {
    year++
  }

  const nextLunar = Lunar.fromYmd(year, lunarMonth, lunarDay)
  const nextSolar = nextLunar.getSolar()
  return `${nextSolar.getYear()}-${String(nextSolar.getMonth()).padStart(2, '0')}-${String(nextSolar.getDay()).padStart(2, '0')}`
}

export function formatLunar(dateStr: string): string {
  const info = toLunarDate(dateStr)
  let result = `${info.month}${info.day}`
  if (info.festival) result = info.festival
  return result
}
