import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailybias.app',
  appName: 'Bias Daily',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Uncomment below if you want to test with a local server during development
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined, // Set this when you create a keystore
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

