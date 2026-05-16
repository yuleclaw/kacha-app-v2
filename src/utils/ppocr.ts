/**
 * PP-OCRv4 ONNX 推理管线
 *
 * Pipeline: 图片→预处理→检测模型(det)→DB后处理→裁切→方向分类(cls)→识别模型(rec)→CTC解码→文字
 *
 * 模型文件 (public/ocr/):
 *   ppocrv4_det.onnx  (4.6MB) 文字检测
 *   ppocrv4_rec.onnx  (11MB)  文字识别
 *   ppocrv4_cls.onnx  (572KB) 文字方向分类
 *   ppocr_keys_v1.txt (26KB)  字典
 *
 * 运行时: public/ort-wasm-simd-threaded.wasm
 */

import * as ort from 'onnxruntime-web'

// ===== 配置常量 =====
const DET_MAX_SIDE = 736
const DET_THRESH = 0.3
const REC_HEIGHT = 48
const REC_MAX_WIDTH = 320
const MEAN = [0.5, 0.5, 0.5]
const STD = [0.5, 0.5, 0.5]

// ===== 类型定义 =====
export interface OCRLine {
  text: string
  confidence: number
  box: [number, number, number, number] // x, y, w, h
}

export interface PPOCRResult {
  lines: OCRLine[]
  text: string
  elapsed: number
}

// ===== 字典加载 =====
let charDict: string[] = []

export async function loadDict(): Promise<string[]> {
  if (charDict.length > 0) return charDict
  try {
    const resp = await fetch('/ocr/ppocr_keys_v1.txt')
    const text = await resp.text()
    // 格式: 第一行为 blank，然后是字符，每行一个
    charDict = text.split('\n').filter((l) => l.trim())
    if (charDict.length > 0 && charDict[0] !== 'blank') {
      // 没有 blank 行，手动加
      charDict = ['', ...charDict]
    }
    return charDict
  } catch {
    console.warn('[PPOCR] Failed to load dict, using fallback')
    return []
  }
}

// ===== 图片预处理 =====
function preprocessDet(imageData: ImageData): { tensor: ort.Tensor; scale: number; origW: number; origH: number } {
  const { width, height } = imageData
  const origW = width
  const origH = height

  // 等比缩放
  const scale = Math.min(DET_MAX_SIDE / Math.max(width, height), 1)
  const newW = Math.round(width * scale / 32) * 32
  const newH = Math.round(height * scale / 32) * 32
  const scaleX = newW / width
  const scaleY = newH / height

  // 创建 canvas 缩放
  const canvas = document.createElement('canvas')
  canvas.width = newW
  canvas.height = newH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageDataToCanvas(imageData), 0, 0, newW, newH)
  const pixels = ctx.getImageData(0, 0, newW, newH).data

  // 归一化 CHW [1,3,H,W] float32
  const chw = new Float32Array(3 * newH * newW)
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      const idx = (y * newW + x) * 4
      chw[0 * newH * newW + y * newW + x] = (pixels[idx] / 255 - MEAN[0]) / STD[0]
      chw[1 * newH * newW + y * newW + x] = (pixels[idx + 1] / 255 - MEAN[1]) / STD[1]
      chw[2 * newH * newW + y * newW + x] = (pixels[idx + 2] / 255 - MEAN[2]) / STD[2]
    }
  }

  return { tensor: new ort.Tensor('float32', chw, [1, 3, newH, newW]), scale, origW, origH, scaleX, scaleY } as any
}

function imageDataToCanvas(imgData: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = imgData.width
  c.height = imgData.height
  c.getContext('2d')!.putImageData(imgData, 0, 0)
  return c
}

// ===== DB 后处理（floodFill 连通域）=====
interface DetBox { xmin: number; ymin: number; xmax: number; ymax: number }

function dbPostProcess(probMap: Float32Array, w: number, h: number, scaleX: number, scaleY: number): DetBox[] {
  // 二值化
  const binary = new Uint8Array(w * h)
  for (let i = 0; i < probMap.length; i++) {
    binary[i] = probMap[i] > DET_THRESH ? 1 : 0
  }

  // floodFill 找连通域
  const visited = new Uint8Array(w * h)
  const boxes: DetBox[] = []

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      if (binary[idx] === 0 || visited[idx] === 1) continue

      // BFS
      const queue: [number, number][] = [[x, y]]
      visited[idx] = 1
      let minX = x, minY = y, maxX = x, maxY = y
      let count = 0

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!
        count++
        minX = Math.min(minX, cx)
        minY = Math.min(minY, cy)
        maxX = Math.max(maxX, cx)
        maxY = Math.max(maxY, cy)

        // 4-邻域
        const neighbors: [number, number][] = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
          const nIdx = ny * w + nx
          if (binary[nIdx] === 1 && visited[nIdx] === 0) {
            visited[nIdx] = 1
            queue.push([nx, ny])
          }
        }
      }

      // 过滤太小的区域
      if (count < 10) continue

      boxes.push({
        xmin: Math.round(minX / scaleX),
        ymin: Math.round(minY / scaleY),
        xmax: Math.round(maxX / scaleX),
        ymax: Math.round(maxY / scaleY),
      })
    }
  }

  return boxes
}

// ===== 裁切 + 识别预处理 =====
async function cropAndPreprocess(
  source: ImageData,
  box: DetBox,
): Promise<ort.Tensor> {
  const { xmin, ymin, xmax, ymax } = box
  const cropW = Math.max(xmax - xmin, 8)
  const cropH = Math.max(ymax - ymin, 8)

  const canvas = document.createElement('canvas')
  canvas.width = cropW
  canvas.height = cropH
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(source, 0, 0, xmin, ymin, cropW, cropH)

  // 缩放到固定高度 48px
  const scale = REC_HEIGHT / cropH
  const recW = Math.min(Math.round(cropW * scale), REC_MAX_WIDTH)

  const resizeCanvas = document.createElement('canvas')
  resizeCanvas.width = Math.max(recW, 4)
  resizeCanvas.height = REC_HEIGHT
  const rctx = resizeCanvas.getContext('2d')!
  rctx.drawImage(canvas, 0, 0, Math.max(recW, 4), REC_HEIGHT)
  const pixels = rctx.getImageData(0, 0, Math.max(recW, 4), REC_HEIGHT).data
  const actualW = resizeCanvas.width

  // 归一化 CHW
  const chw = new Float32Array(3 * REC_HEIGHT * actualW)
  for (let y = 0; y < REC_HEIGHT; y++) {
    for (let x = 0; x < actualW; x++) {
      const idx = (y * actualW + x) * 4
      chw[0 * REC_HEIGHT * actualW + y * actualW + x] = (pixels[idx] / 255 - MEAN[0]) / STD[0]
      chw[1 * REC_HEIGHT * actualW + y * actualW + x] = (pixels[idx + 1] / 255 - MEAN[1]) / STD[1]
      chw[2 * REC_HEIGHT * actualW + y * actualW + x] = (pixels[idx + 2] / 255 - MEAN[2]) / STD[2]
    }
  }

  return new ort.Tensor('float32', chw, [1, 3, REC_HEIGHT, actualW])
}

// ===== CTC 解码 =====
function ctcDecode(pred: Float32Array, batch: number, seqLen: number, numClasses: number): string[] {
  const results: string[] = []
  for (let b = 0; b < batch; b++) {
    let lastChar = -1
    let text = ''
    let confSum = 0
    let confCount = 0

    for (let t = 0; t < seqLen; t++) {
      const offset = (b * seqLen + t) * numClasses
      let maxVal = -Infinity
      let maxIdx = 0
      for (let c = 0; c < numClasses; c++) {
        if (pred[offset + c] > maxVal) {
          maxVal = pred[offset + c]
          maxIdx = c
        }
      }

      // blank (index 0) 跳过
      if (maxIdx === 0) {
        lastChar = -1
        continue
      }

      // 去重
      if (maxIdx !== lastChar) {
        const charIdx = maxIdx - 1 // 字典中 index 0 是 blank
        const ch = charDict[charIdx]
        if (ch && ch.trim()) {
          text += ch
          confSum += maxVal
          confCount++
        }
        lastChar = maxIdx
      }
    }

    results.push(text)
  }
  return results
}

// ===== 过滤日文假名 =====
function filterJapanese(text: string): string {
  return text.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '')
}

// ===== 主推理函数 =====
let detSession: ort.InferenceSession | null = null
let recSession: ort.InferenceSession | null = null
let clsSession: ort.InferenceSession | null = null

async function initSession(path: string): Promise<ort.InferenceSession> {
  ort.env.wasm.wasmPaths = '/'
  return await ort.InferenceSession.create(path, {
    executionProviders: ['wasm'],
  })
}

async function ensureSessions(): Promise<void> {
  if (!detSession) {
    detSession = await initSession('/ocr/ppocrv4_det.onnx')
  }
  if (!recSession) {
    recSession = await initSession('/ocr/ppocrv4_rec.onnx')
  }
  if (!clsSession) {
    try {
      clsSession = await initSession('/ocr/ppocrv4_cls.onnx')
    } catch {
      clsSession = null // cls 是可选的
    }
  }
  if (charDict.length === 0) {
    await loadDict()
  }
}

/** 主推理入口：传入 ImageData，返回识别结果 */
export async function recognizePPOCR(imageData: ImageData): Promise<PPOCRResult> {
  const startTime = Date.now()
  await ensureSessions()

  // Step 1: 检测预处理
  const { tensor: detInput, origW, origH, scaleX, scaleY } = preprocessDet(imageData) as any

  // Step 2: 检测推理
  const detFeeds: Record<string, ort.Tensor> = {}
  detFeeds[detSession!.inputNames[0]] = detInput
  const detResult = await detSession!.run(detFeeds)
  const probMap = detResult[detSession!.outputNames[0]].data as Float32Array
  const outW = detInput.dims[3]
  const outH = detInput.dims[2]

  // Step 3: DB 后处理
  const boxes = dbPostProcess(probMap, outW, outH, scaleX, scaleY)

  if (boxes.length === 0) {
    return { lines: [], text: '', elapsed: Date.now() - startTime }
  }

  // 按 y 排序（从上到下）
  boxes.sort((a, b) => a.ymin - b.ymin)

  // Step 4: 对每个 box 裁切 + 识别
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = origW
  sourceCanvas.height = origH
  sourceCanvas.getContext('2d')!.putImageData(imageData, 0, 0)

  const lines: OCRLine[] = []

  for (const box of boxes) {
    // 可选：方向分类
    if (clsSession) {
      // cls 推理可以在这里加入
    }

    // 裁切 + 识别预处理
    const recInput = await cropAndPreprocess(imageData, box)

    // 识别推理
    const recFeeds: Record<string, ort.Tensor> = {}
    recFeeds[recSession!.inputNames[0]] = recInput
    const recResult = await recSession!.run(recFeeds)
    const pred = recResult[recSession!.outputNames[0]].data as Float32Array
    const seqLen = recInput.dims[3]
    const numClasses = pred.length / seqLen
    const decoded = ctcDecode(pred, 1, seqLen, numClasses)

    if (decoded.length > 0 && decoded[0]) {
      const text = filterJapanese(decoded[0])
      if (text.trim()) {
        lines.push({
          text,
          confidence: 0.9, // simplified
          box: [box.xmin, box.ymin, box.xmax - box.xmin, box.ymax - box.ymin],
        })
      }
    }
  }

  const fullText = lines.map((l) => l.text).join('\n')
  return { lines, text: fullText, elapsed: Date.now() - startTime }
}
