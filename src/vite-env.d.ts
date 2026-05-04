/// <reference types="vite/client" />

interface Window {
  kachaNavigate: (page: string, opts?: Record<string, string>) => void
}
