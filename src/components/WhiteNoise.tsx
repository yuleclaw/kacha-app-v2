import { useRef, useEffect } from 'react'

interface WhiteNoiseProps {
  type: 'rain' | 'ocean' | 'forest' | 'cafe' | 'none'
  enabled: boolean
  onEnded?: () => void
}

/**
 * 白噪声播放组件
 * 使用 HTMLAudioElement + 循环播放
 * 注意：实际音效文件需要放在 public/sounds/ 目录
 * 文件: rain.mp3, ocean.mp3, forest.mp3, cafe.mp3, complete.mp3
 */
export default function WhiteNoise({ type, enabled }: WhiteNoiseProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled || type === 'none') {
      audioRef.current?.pause()
      return
    }
    const audio = audioRef.current
    if (!audio) return
    audio.src = `/sounds/${type}.wav`
    audio.loop = true
    audio.volume = 0.3
    audio.play().catch(() => {
      // Autoplay blocked - user interaction needed
    })
  }, [type, enabled])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return <audio ref={audioRef} preload="none" />
}

/** 播放完成音效 */
export function playCompleteSound() {
  try {
    const audio = new Audio('/sounds/complete.wav')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch { /* noop */ }
}
