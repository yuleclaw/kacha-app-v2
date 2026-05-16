// ===== 数据模型 v3.5 =====

export interface Anniversary {
  id: string
  title: string
  date: string // ISO date
  repeatType: 'yearly' | 'monthly' | 'weekly' | 'custom' | 'none'
  repeatInterval?: number // 自定义间隔天数
  notifyBefore: number
  notifyEnabled: boolean
  notifyTimes: number[]
  category: 'birthday' | 'love' | 'work' | 'other'
  lunar: boolean
  imageUrl?: string // 封面图 base64
  createdAt: number
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
  createdAt: number
}

/** 物品分类（12种） */
export type ItemCategory =
  | 'food' | 'cosmetics' | 'medicine' | 'electronics'
  | 'appliance' | 'clothing' | 'membership' | 'subscription'
  | 'warranty' | 'document' | 'other'

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  food: '食品',
  cosmetics: '化妆品',
  medicine: '药品',
  electronics: '电子产品',
  appliance: '家电',
  clothing: '服装',
  membership: '会员',
  subscription: '订阅',
  warranty: '保修',
  document: '证件',
  other: '其他',
}

/** 统一物品项（合并保质期 + 保修期） */
export interface ExpiryItem {
  id: string
  name: string
  type: 'shelfLife' | 'warranty'
  expiryDate: string
  category: ItemCategory
  brand?: string
  imageUrl?: string
  notifyDaysBefore: number
  notifyEnabled: boolean
  // 保修特有
  purchaseDate?: string
  extendedWarranty?: number // 延保月数
  extendedWarrantyCost?: number
  notes?: string
  createdAt: number
}

export interface Coupon {
  id: string
  name: string
  source: 'jd' | 'taobao' | 'meituan' | 'starbucks' | 'eleme' | 'douyin' | 'other'
  discount: string
  condition: string
  expiryDate: string
  code: string
  category: string
  imageUrl: string
  notifyEnabled: boolean
  sourceUrl?: string
  deepLink?: boolean
  createdAt: number
}

export type ExpenseCategory = 'transport' | 'hotel' | 'food' | 'telecom' | 'entertainment' | 'misc'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: '交通',
  hotel: '住宿',
  food: '餐饮',
  telecom: '通讯',
  entertainment: '招待',
  misc: '杂费',
}

export type TransportType = 'train' | 'flight' | 'taxi' | 'self-drive'

export interface ExpenseItem {
  id: string
  date: string
  category: ExpenseCategory
  description: string
  amount: number
  // 交通字段
  transportType?: TransportType
  from?: string
  to?: string
  km?: number
  unitPrice?: number
  // 餐饮字段
  subsidyType?: 'standard' | 'special' | 'executive'
  days?: number
  // 住宿字段
  hotelName?: string
  nights?: number
  // 发票
  invoicePhoto?: string // base64
  invoiceNumber?: string
  // 其他
  notes?: string
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
  createdAt: number
}

export interface TravelExpense {
  category: string
  amount: number
  description: string
}

export interface Travel {
  id: string
  name: string
  startDate: string
  endDate: string
  days: TravelDay[]
  companions: string[]
  status: 'planning' | 'ongoing' | 'completed'
  timezone?: string
  emergencyInfo?: {
    passport?: string
    embassyPhone?: string
    insurance?: string
  }
  expenses?: TravelExpense[]
  createdAt: number
}

export interface TravelDay {
  id: string
  date: string
  activities: TravelActivity[]
}

export interface TravelActivity {
  id: string
  time: string
  type: 'transport' | 'hotel' | 'food' | 'sightseeing' | 'shopping' | 'other'
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
  floatingWindowMode: number // 0=时钟 1=倒计时 2=秒表
  ocrServerUrl: string
  whiteNoiseEnabled: boolean
  whiteNoiseType: 'rain' | 'ocean' | 'forest' | 'cafe' | 'none'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  dndEnabled: false,
  dndStart: '22:00',
  dndEnd: '08:00',
  floatingWindowEnabled: false,
  floatingWindowMode: 0,
  ocrServerUrl: '',
  whiteNoiseEnabled: false,
  whiteNoiseType: 'none',
}

// ===== 标签映射 =====

export const PLATFORM_LABELS: Record<string, string> = {
  jd: '京东',
  taobao: '淘宝',
  pinduoduo: '拼多多',
  dewu: '得物',
  meituan: '美团',
  starbucks: '星巴克',
  eleme: '饿了么',
  douyin: '抖音',
  other: '其他',
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  transport: '交通',
  hotel: '住宿',
  food: '美食',
  sightseeing: '观光',
  shopping: '购物',
  other: '其他',
}

export const SUBSIDY_LABELS: Record<string, string> = {
  standard: '标准(100/天)',
  special: '特殊(150/天)',
  executive: '高管(200/天)',
}

export const TRANSPORT_TYPE_LABELS: Record<string, string> = {
  train: '火车',
  flight: '飞机',
  taxi: '出租车',
  'self-drive': '自驾',
}

// ===== 通用类型 =====

export type PageName =
  | 'home' | 'anniversary' | 'focus'
  | 'pomodoro' | 'timer' | 'stopwatch' | 'flash'
  | 'expiry' | 'coupon' | 'expense'
  | 'items' | 'schedule' | 'travel' | 'travel-detail'
  | 'scan' | 'settings' | 'stats'

export type UniversalAddType = 'anniversary' | 'expiry' | 'coupon' | 'flash' | 'schedule' | 'travel' | 'expense'
