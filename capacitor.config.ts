import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.debiasdaily.app',
  appName: 'Bias Daily',
  webDir: 'out',
  server: {
    // For development, you can point to a local server
    // For production, leave undefined to use bundled web assets
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#000000',
      sound: 'beep.wav',
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined, // Set in gradle.properties for production
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'Bias Daily',
    contentInset: 'automatic',
  },
};

export default config;
