
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('category')
          .eq('id', user.id)
          .single();

        if (profile?.category) {
          router.replace('/home');
        } else {
          router.replace('/survey');
        }
      } else {
        router.replace('/login');
      }
    };

    checkUser();
  }, [router, supabase]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
