/**
 * PP-OCRv4 ONNX 推理管线 — 暂禁用，需安装 onnxruntime-web
 */
export interface OCRLine {
  text: string
  confidence: number
  box: [number, number, number, number]
}
export interface PPOCRResult {
  lines: OCRLine[]
  text: string
  elapsed: number
}
export async function recognizePPOCR(_imageData: ImageData): Promise<PPOCRResult> {
  return { lines: [], text: '', elapsed: 0 }
}
