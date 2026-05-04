import { Solar, Lunar } from 'lunar-javascript'

export function toLunarDate(dateStr: string): { year: string; month: string; day: string; animal: string; ganZhiYear: string; festival: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const solar = Solar.fromYmd(year, month, day)
  const lunarObj = solar.getLunar()

  return {
    year: `${lunarObj.getYearInChinese()}Äê`,
    month: lunarObj.getMonthInChinese() + 'ÔÂ',
    day: lunarObj.getDayInChinese(),
    animal: lunarObj.getYearShengXiao(),
    ganZhiYear: `${lunarObj.getYearInGanZhi()}Äê`,
    festival: lunarObj.getFestivals()?.[0] || '',
  }
}

export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false): string {
  const lunarObj = Lunar.fromYmd(year, month, day, isLeapMonth)
  const solar = lunarObj.getSolar()
  return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
}

export function getNextLunarDate(lunarMonth: number, lunarDay: number): string {
  const today = new Date()
  const solar = Solar.fromDate(today)
  const lunarObj = solar.getLunar()

  let year = lunarObj.getYear()
  if (lunarObj.getMonth() > lunarMonth || (lunarObj.getMonth() === lunarMonth && lunarObj.getDay() >= lunarDay)) {
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