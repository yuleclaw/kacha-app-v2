/**
 * OCR 识别引擎 — 混合架构
 *
 * 本地: PP-OCRv4 ONNX (ppocr.ts)
 * 云端: RapidOCR (fallback)
 *
 * Pipeline:
 *   图片 → PP-OCRv4 本地推理 → ↓有结果 返回
 *                              ↓无结果 RapidOCR API → 返回
 */

import { recognizePPOCR, type PPOCRResult, type OCRLine } from './ppocr'

export interface OcrProgress {
  status: string
  progress: number
}

export type OcrType = 'coupon' | 'flash' | 'schedule' | 'travel' | 'expiry' | 'anniversary' | 'unknown'

export interface OcrResult {
  text: string
  type: OcrType
  confidence: number
  source: 'local' | 'cloud'
  lines?: OCRLine[]
}

/** 云端 RapidOCR API */
async function recognizeCloud(imageBase64: string, cloudUrl: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(`${cloudUrl}/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
      signal: controller.signal,
    })
    const data = await resp.json()
    return data.text || ''
  } finally {
    clearTimeout(timeout)
  }
}

/** 智能分类识别文本 */
export function guessOcrType(text: string): OcrType {
  const t = text.toLowerCase()
  // 中文关键词
  if (t.indexOf('券') !== -1 || t.indexOf('优惠') !== -1 || t.indexOf('折扣') !== -1 || t.indexOf('满减') !== -1 || t.indexOf('代金') !== -1) return 'coupon'
  if (t.indexOf('秒杀') !== -1 || t.indexOf('抢购') !== -1 || t.indexOf('闪购') !== -1) return 'flash'
  if (t.indexOf('日程') !== -1 || t.indexOf('会议') !== -1 || t.indexOf('预约') !== -1 || t.indexOf('会见') !== -1) return 'schedule'
  if (t.indexOf('旅行') !== -1 || t.indexOf('行程') !== -1 || t.indexOf('航班') !== -1 || t.indexOf('高铁') !== -1 || t.indexOf('酒店') !== -1) return 'travel'
  if (t.indexOf('保修') !== -1 || t.indexOf('售后') !== -1 || t.indexOf('维修') !== -1 || t.indexOf('guarantee') !== -1) return 'expiry'
  if (t.indexOf('纪念') !== -1 || t.indexOf('生日') !== -1 || t.indexOf('周年') !== -1 || t.indexOf('birthday') !== -1) return 'anniversary'
  return 'unknown'
}

/** 图片文件转 ImageData */
function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      URL.revokeObjectURL(url)
      resolve(imageData)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

/**
 * 主识别入口
 * 1. 先尝试本地 PP-OCRv4 ONNX
 * 2. 如果无结果且配置了云端 OCR URL，尝试 RapidOCR
 */
export async function recognizeImage(
  file: File,
  _progressCallback?: (p: OcrProgress) => void,
  cloudOcrUrl?: string,
): Promise<OcrResult> {
  // Step 1: 尝试本地 PP-OCRv4
  try {
    const imageData = await fileToImageData(file)
    const localResult: PPOCRResult = await recognizePPOCR(imageData)

    if (localResult.text.trim()) {
      const type = guessOcrType(localResult.text)
      return {
        text: localResult.text,
        type,
        confidence: 0.9,
        source: 'local',
        lines: localResult.lines,
      }
    }

    // Step 2: 本地无结果，尝试云端
    if (cloudOcrUrl) {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1] || '')
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const cloudText = await recognizeCloud(base64, cloudOcrUrl)
      if (cloudText.trim()) {
        const type = guessOcrType(cloudText)
        return { text: cloudText, type, confidence: 0.95, source: 'cloud' }
      }
    }

    return { text: '', type: 'unknown', confidence: 0, source: 'local' }
  } catch (err) {
    console.error('[OCR] Error:', err)
    return { text: '', type: 'unknown', confidence: 0, source: 'local' }
  }
}
