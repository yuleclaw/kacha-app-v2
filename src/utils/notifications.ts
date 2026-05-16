/**
 * 本地通知系统
 * 基于 Capacitor LocalNotifications 插件
 * 
 * 通知类型:
 * - anniversary: 纪念日提醒
 * - expiry: 物品到期提醒
 * - flash: 秒杀提醒
 * - schedule: 日程提醒
 * - pomodoro: 番茄完成
 */

// Capacitor LocalNotifications plugin types
interface LocalNotification {
  title: string
  body: string
  id: number
  schedule?: { at: Date }
  sound?: string
}

let notificationId = 1000

/** 发送本地通知 */
export async function sendNotification(
  title: string,
  body: string,
  scheduleAt?: Date,
): Promise<void> {
  notificationId++

  // Capacitor plugin call (commented out until plugin is installed)
  /*
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.schedule({
    notifications: [{
      title,
      body,
      id: notificationId,
      schedule: scheduleAt ? { at: scheduleAt } : undefined,
      sound: 'complete.wav',
    }],
  })
  */

  // Fallback: console log
  console.log(`[Notification] ${title}: ${body}`)
}

/** 请求通知权限 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // const { LocalNotifications } = await import('@capacitor/local-notifications')
    // const perm = await LocalNotifications.requestPermissions()
    // return perm.display === 'granted'
    return true
  } catch {
    return false
  }
}

/** 取消所有通知 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    // const { LocalNotifications } = await import('@capacitor/local-notifications')
    // await LocalNotifications.cancelAll()
  } catch { /* noop */ }
}
