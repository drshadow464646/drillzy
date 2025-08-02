
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/context/UserDataProvider';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const { isLoading } = useUserData();

  useEffect(() => {
    if (!isLoading) {
      // The UserDataProvider will handle redirecting to the correct page
      // (login, survey, or home) based on the user's auth state and profile.
      // We just need to wait for it to finish loading.
      // A small delay can prevent a flicker if the redirect is very fast.
      setTimeout(() => router.replace('/home'), 50);
    }
  }, [isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
