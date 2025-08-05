
"use client";

import { Loader2 } from 'lucide-react';

// This page is now primarily a loading fallback.
// The actual routing logic is handled by the middleware.
export default function SplashPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
