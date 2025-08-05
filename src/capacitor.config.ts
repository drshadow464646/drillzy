
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drillzy.app',
  appName: 'Drillzy',
  // webDir is removed because we are loading a remote URL, not local files.
  // webDir: 'out', 
  bundledWebRuntime: false,
  server: {
    // Replace this with your app's live URL when you deploy it
    url: 'https://[YOUR_VERCEL_URL].vercel.app', 
    cleartext: true
  },
  // Add this to your Supabase Redirect URLs: drillzy://auth/callback
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
