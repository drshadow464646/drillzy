
'use client';

import { useSearchParams } from 'next/navigation';

export default function LoginMessage() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    if (!message) return null;

    return (
        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-md">
            {message}
        </p>
    );
}
