
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        setIsLoading(false);

        if (error) {
            setError(`Error updating password: ${error.message}`);
        } else {
            setMessage("Your password has been successfully updated! Redirecting to login...");
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>Enter and confirm your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form className="space-y-4" onSubmit={handlePasswordReset}>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input 
                                id="confirm-password" 
                                name="confirm-password" 
                                type="password" 
                                required 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

             {(message || error) && (
                <p className={`mt-4 p-4 text-center rounded-md w-full max-w-sm ${
                    error 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-foreground/10 text-foreground'
                }`}>
                    {error || message}
                </p>
            )}
        </div>
    );
}
