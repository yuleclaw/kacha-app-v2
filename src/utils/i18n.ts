/**
 * 简单的国际化工具 (i18n)
 * 支持中文/English 切换
 * 用法: t('home.title') → "首页" 或 "Home"
 */

const zh: Record<string, string> = {
  'app.name': '咔嚓',
  'tab.home': '首页',
  'tab.focus': '专注',
  'tab.items': '物品',
  'tab.schedule': '日程',
  'tab.travel': '旅行',
  'page.scan': '扫描识别',
  'page.settings': '设置',
  'page.stats': '统计',
  'page.anniversary': '纪念日',
  'page.expiry': '物品管理',
  'page.coupon': '优惠券',
  'page.expense': '报销',
  'page.flash': '秒杀管理',
  'page.travel': '旅行',
  'action.add': '添加',
  'action.edit': '编辑',
  'action.delete': '删除',
  'action.save': '保存',
  'action.cancel': '取消',
  'action.confirm': '确定',
  'action.back': '返回',
  'common.loading': '加载中...',
  'common.empty': '暂无数据',
  'common.search': '搜索',
  'theme.light': '浅色模式',
  'theme.dark': '深色模式',
  'whiteNoise.rain': '雨声',
  'whiteNoise.ocean': '海浪',
  'whiteNoise.forest': '森林',
  'whiteNoise.cafe': '咖啡厅',
  'floating.clock': '时钟',
  'floating.countdown': '倒计时',
  'floating.stopwatch': '秒表',
  'settings.pomodoro': '番茄钟设置',
  'settings.dnd': '免打扰',
  'settings.theme': '外观',
  'settings.language': '语言',
  'settings.floating': '悬浮窗',
  'settings.ocr': '云端OCR',
  'settings.data': '数据管理',
  'stats.pomodoro': '番茄钟',
  'stats.items': '物品',
  'stats.coupons': '优惠券',
  'stats.schedule': '日程',
}

const en: Record<string, string> = {
  'app.name': 'Kacha',
  'tab.home': 'Home',
  'tab.focus': 'Focus',
  'tab.items': 'Items',
  'tab.schedule': 'Schedule',
  'tab.travel': 'Travel',
  'page.scan': 'Scan',
  'page.settings': 'Settings',
  'page.stats': 'Stats',
  'page.anniversary': 'Anniversary',
  'page.expiry': 'Items',
  'page.coupon': 'Coupons',
  'page.expense': 'Expenses',
  'page.flash': 'Flash Sales',
  'page.travel': 'Travel',
  'action.add': 'Add',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.confirm': 'Confirm',
  'action.back': 'Back',
  'common.loading': 'Loading...',
  'common.empty': 'No data',
  'common.search': 'Search',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'whiteNoise.rain': 'Rain',
  'whiteNoise.ocean': 'Ocean',
  'whiteNoise.forest': 'Forest',
  'whiteNoise.cafe': 'Cafe',
  'floating.clock': 'Clock',
  'floating.countdown': 'Countdown',
  'floating.stopwatch': 'Stopwatch',
  'settings.pomodoro': 'Pomodoro',
  'settings.dnd': 'DND',
  'settings.theme': 'Theme',
  'settings.language': 'Language',
  'settings.floating': 'Floating Window',
  'settings.ocr': 'Cloud OCR',
  'settings.data': 'Data',
  'stats.pomodoro': 'Pomodoro',
  'stats.items': 'Items',
  'stats.coupons': 'Coupons',
  'stats.schedule': 'Schedule',
}

let currentLang: 'zh' | 'en' = 'zh'

const dict: Record<string, Record<string, string>> = { zh, en }

export function setLanguage(lang: 'zh' | 'en'): void {
  currentLang = lang
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
}

export function getLanguage(): 'zh' | 'en' {
  return currentLang
}

export function t(key: string): string {
  return dict[currentLang]?.[key] || dict['zh']?.[key] || key
}
