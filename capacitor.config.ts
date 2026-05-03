import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.kacha.app',
  appName: 'kacha',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#7F77DD',
      sound: 'default',
    },
    Camera: {
      presentationStyle: 'fullscreen',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
  },
  android: {
    minSdkVersion: 24,
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      releaseType: 'APK',
    },
  },
});
