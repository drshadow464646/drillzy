
"use client";

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoginButtonProps {
    isPending: boolean;
}

export function LoginButton({ isPending }: LoginButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
            </>
        ) : (
            "Login"
        )}
    </Button>
  );
}
