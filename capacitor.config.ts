
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drillzy.app',
  appName: 'Drillzy',
  // webDir is removed because we are loading a remote URL, not local files.
  // webDir: 'out', 
  bundledWebRuntime: false,
  server: {
    // Replace this with your app's live URL when you deploy it
    url: 'https://your-app-url.com', 
    cleartext: true
  }
};

export default config;
