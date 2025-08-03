
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requestPasswordReset } from './actions';
import { Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const { error } = await requestPasswordReset(new FormData(event.currentTarget));

        setIsLoading(false);

        if (error) {
            setError(error);
        } else {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center gap-2">
                           <MailCheck className="h-8 w-8 text-green-500" />
                            <span>Check Your Email</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            A password reset link has been sent to <strong className="text-foreground">{email}</strong>. Please check your inbox (and spam folder) to continue.
                        </p>
                        <Button asChild className="w-full mt-6">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Enter your email below and we'll send you a link to reset your password.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="you@example.com"
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                    {error && (
                        <p className="mt-4 text-sm text-center text-destructive">{error}</p>
                    )}
                </CardContent>
            </Card>
            <Button variant="link" size="sm" asChild className="mt-4">
                <Link href="/login">Back to Login</Link>
            </Button>
        </div>
    );
}
