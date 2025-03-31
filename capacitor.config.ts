
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starrealmsassistant.app',
  appName: 'StarRealmsAssistant',
  webDir: 'dist/capacitor-app',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
