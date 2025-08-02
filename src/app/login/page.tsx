
"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const searchParams = useSearchParams();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(searchParams.get('message') || '');
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(Capacitor.isNativePlatform());
    }, []);

    const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === 'Email not confirmed') {
                setMessage('Email not confirmed. Please check your inbox for the verification link.');
            } else {
                setMessage('Invalid credentials. Please try again.');
            }
        } else {
            router.push('/home');
            router.refresh();
        }
    };

    const handleSignup = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const signupRedirectTo = isNative 
            ? 'drillzy://auth/callback'
            : `${window.location.origin}/auth/callback`;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: signupRedirectTo,
                data: { name },
            },
        });

        if (error) {
            setMessage('Could not create user. The user may already exist or the password may be too weak.');
        } else {
            setMessage('Check your email to complete the signup process.');
        }
    };
    
    const handlePasswordReset = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!email) {
            setMessage('Please enter your email address to reset your password.');
            return;
        }

        const resetRedirectTo = isNative
          ? 'drillzy://auth/callback' // Native apps handle this via deep links
          : `${window.location.origin}/auth/callback`; // Web handles this via URL

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: resetRedirectTo,
        });

        if (error) {
            console.error("Password Reset Error:", error);
            setMessage(`Error: Could not send recovery email. Please ensure you have configured your SMTP settings in Supabase and the redirect URL is whitelisted.`);
        } else {
            setMessage('Password reset link sent! Please check your email.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground">Drillzy</h1>
                 <p className="text-lg text-muted-foreground">
                    By{' '}
                    <a
                        href="https://astoeterna.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                    >
                        Asto Eterna
                    </a>
                </p>
                <p className="text-muted-foreground mt-2">Sign in or create an account to start your journey.</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Enter your credentials to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input id="email-login" name="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-login">Password</Label>
                                    <Input id="password-login" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="text-right">
                                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={handlePasswordReset}>
                                        Forgot Password?
                                    </Button>
                                </div>
                                <Button onClick={handleLogin} className="w-full">Login</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>Create an account to track your progress.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name-signup">Name</Label>
                                    <Input id="name-signup" name="name" type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" name="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input id="password-signup" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <Button onClick={handleSignup} className="w-full">Create Account</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

             {message && (
                <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-md">
                    {message}
                </p>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
