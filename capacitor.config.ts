import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kacha.app',
  appName: '咔嚓',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
