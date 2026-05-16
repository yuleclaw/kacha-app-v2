/**
 * Deep Link 工具 — 跳转到第三方 App
 * 
 * 平台 URL Schemes:
 * - 京东: openApp.jdMobile.com
 * - 淘宝: taobao://
 * - 拼多多: pinduoduo://
 * - 美团: meituan://
 * - 饿了么: eleme://
 * - 星巴克: starbucks://
 * - 抖音: snssdk1128://
 */

const DEEP_LINKS: Record<string, string> = {
  jd: 'openApp.jdMobile.com',
  taobao: 'taobao://',
  pinduoduo: 'pinduoduo://',
  meituan: 'meituan://',
  eleme: 'eleme://',
  starbucks: 'starbucks://',
  douyin: 'snssdk1128://',
}

/** 打开指定平台的 Deep Link */
export function openDeepLink(platform: string, url?: string): void {
  const scheme = DEEP_LINKS[platform]
  if (!scheme) return

  // 优先用提供的 URL，否则用平台 scheme
  const target = url || scheme

  try {
    // 尝试 location.href 跳转
    const link = document.createElement('a')
    link.href = target
    link.target = '_blank'
    link.click()
  } catch { /* noop */ }
}

/** 复制文本到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}
