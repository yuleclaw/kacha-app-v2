// ===== 数据模型 =====

export interface Anniversary {
  id: string
  title: string
  date: string // YYYY-MM-DD
  repeatYearly: boolean
  notifyBefore: number
  notifyEnabled: boolean
  notifyTimes: number[]
  category: 'birthday' | 'love' | 'work' | 'other'
  lunar: boolean
}

export interface FlashSale {
  id: string
  productName: string
  platform: 'jd' | 'taobao' | 'pinduoduo' | 'dewu'
  originalPrice: string
  salePrice: string
  startTime: string
  productUrl: string
  notifyEnabled: boolean
  notifyMinutesBefore: number[]
}

export interface ExpiryItem {
  id: string
  name: string
  type: 'food' | 'cosmetic' | 'medicine' | 'other'
  expiryDate: string
  productionDate: string
  shelfLife: number
  notifyDaysBefore: number
  notifyEnabled: boolean
  imageUrl: string
  category: string
}

export interface WarrantyItem {
  id: string
  name: string
  type: 'electronics' | 'appliance' | 'other'
  purchaseDate: string
  warrantyExpiry: string
  notifyDaysBefore: number
  notifyEnabled: boolean
  imageUrl: string
  notes: string
}

export interface Coupon {
  id: string
  name: string
  source: 'jd' | 'taobao' | 'meituan' | 'starbucks' | 'other'
  discount: string
  condition: string
  expiryDate: string
  code: string
  category: string
  imageUrl: string
  notifyEnabled: boolean
}

export interface Expense {
  id: string
  amount: number
  category: 'food' | 'transport' | 'hotel' | 'office' | 'other'
  date: string
  description: string
  imageUrl: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
}

export interface Schedule {
  id: string
  title: string
  startTime: string
  endTime: string
  location: string
  contactName: string
  contactPhone: string
  notes: string
  linkedTransport: string
  notifyBefore: number
  notifyEnabled: boolean
}

export interface Travel {
  id: string
  name: string
  startDate: string
  endDate: string
  days: TravelDay[]
  companions: string[]
  status: 'planning' | 'ongoing' | 'completed'
}

export interface TravelDay {
  id: string
  date: string
  activities: Activity[]
}

export interface Activity {
  id: string
  time: string
  type: 'transport' | 'sightseeing' | 'food' | 'hotel' | 'shopping' | 'other'
  title: string
  description: string
  location: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  pomodoroWork: number
  pomodoroBreak: number
  dndEnabled: boolean
  dndStart: string
  dndEnd: string
  floatingWindowEnabled: boolean
  ocrServerUrl: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  dndEnabled: false,
  dndStart: '22:00',
  dndEnd: '08:00',
  floatingWindowEnabled: false,
  ocrServerUrl: '',
}

// ===== 标签映射 =====

export const PLATFORM_LABELS: Record<string, string> = {
  jd: '京东',
  taobao: '淘宝',
  pinduoduo: '拼多多',
  dewu: '得物',
  meituan: '美团',
  starbucks: '星巴克',
  other: '其他',
}

export const CATEGORY_LABELS: Record<string, string> = {
  birthday: '生日',
  love: '恋爱',
  work: '工作',
  other: '其他',
  food: '食物',
  cosmetic: '化妆品',
  medicine: '药品',
  electronics: '电子产品',
  appliance: '家电',
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  food: '餐饮',
  transport: '交通',
  hotel: '酒店',
  office: '办公',
  other: '其他',
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  transport: '交通',
  sightseeing: '观光',
  food: '美食',
  hotel: '酒店',
  shopping: '购物',
  other: '其他',
}

// ===== 通用类型 =====

export type PageName =
  | 'home'
  | 'anniversary'
  | 'focus'
  | 'pomodoro'
  | 'timer'
  | 'stopwatch'
  | 'flash'
  | 'expiry'
  | 'warranty'
  | 'coupon'
  | 'expense'
  | 'items'
  | 'schedule'
  | 'travel'
  | 'travel-detail'
  | 'scan'
  | 'settings'
  | 'stats'

export type UniversalAddType = 'anniversary' | 'expiry' | 'warranty' | 'coupon' | 'flash' | 'schedule' | 'travel' | 'expense'
