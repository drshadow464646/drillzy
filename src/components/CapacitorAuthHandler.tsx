
'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CapacitorAuthHandler = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Only run this on native platforms
    if (Capacitor.isNativePlatform()) {
      // This listener handles the app being opened by a deep link
      App.addListener('appUrlOpen', async (event) => {
        const url = new URL(event.url);
        const hash = url.hash.substring(1); // Remove the '#'
        
        // Supabase sends tokens in the URL fragment (#)
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              // Redirect to a protected route after successful session set
              router.push('/home');
            } else {
              console.error('Error setting Supabase session:', error);
              // Optionally redirect to login with an error
              router.push('/login?message=Login failed. Please try again.');
            }
          }
        }
      });
    }
  }, [router, supabase.auth]);

  return <>{children}</>;
};

export default CapacitorAuthHandler;
