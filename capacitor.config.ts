import { CapacitorConfig } from '@capacitor/cli';

// Detect if we're in development mode
const isDev = process.env.NODE_ENV === 'development';
// Get local IP address for live reload (falls back to localhost)
const getLocalUrl = () => {
  // In development, you can set CAPACITOR_SERVER_URL environment variable
  // Or it will use localhost (works for emulator)
  // For physical device, use your computer's IP: http://192.168.x.x:3000
  return process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000';
};

const config: CapacitorConfig = {
  appId: 'com.dailybias.app',
  appName: 'Bias Daily',
  webDir: 'out',
  server: (() => {
    const baseConfig = {
      androidScheme: 'https' as const,
    };
    
    // Enable live reload in development mode
    // Set CAPACITOR_LIVE_RELOAD=true to enable
    // For emulator: use 'http://localhost:3000'
    // For physical device: use your computer's IP (e.g., 'http://192.168.1.100:3000')
    // Find your IP: macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
    //                Windows: ipconfig
    //                Linux: hostname -I
    if (isDev && process.env.CAPACITOR_LIVE_RELOAD === 'true') {
      return {
        ...baseConfig,
        url: getLocalUrl(),
        cleartext: true, // Required for http:// connections
      };
    }
    
    return baseConfig;
  })(),
  android: {
    buildOptions: {
      keystorePath: undefined, // Set this when you create a keystore
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },
  ios: {
    // iOS-specific configuration
    // Add iOS platform with: npx cap add ios
    contentInset: 'automatic',
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

