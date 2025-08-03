import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drillzy.app',
  appName: 'Drillzy',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
