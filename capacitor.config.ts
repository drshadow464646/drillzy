
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drillzy.app',
  appName: 'Drillzy',
  webDir: 'out',
  bundledWebRuntime: false,
  // Add this to your Supabase Redirect URLs for native auth: com.drillzy.app://auth/callback
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
