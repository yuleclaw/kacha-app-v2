declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar
    static fromDate(date: Date): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    getLunar(): Lunar
    toFullString(): string
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number, isLeapMonth?: boolean): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
    getSolar(): Solar
    getYearInChinese(): string
    getMonthInChinese(): string
    getDayInChinese(): string
    toFullString(): string
  }
}
