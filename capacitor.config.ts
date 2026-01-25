import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ovb.firmenvorstellung',
  appName: 'OVB Firmenvorstellung',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      // iOS: Status Bar ausblenden
      overlaysWebView: false,
    },
  },
  ios: {
    // Fullscreen für iOS
    contentInset: 'never',
    // Status Bar Einstellungen
    preferredContentMode: 'mobile',
  },
  android: {
    // Android-spezifische Einstellungen
    allowMixedContent: true,
  }
};

export default config;