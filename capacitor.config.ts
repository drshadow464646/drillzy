
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drillzy.app',
  appName: 'Drillzy',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // For local development, point to your dev server.
    // Before building your native app, change this to your deployed web app URL.
    // For example: 'https://myapp.vercel.app'
    url: 'https://drillzy-etpo.vercel.app',
    cleartext: true,
  },
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
