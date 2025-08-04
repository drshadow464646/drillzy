
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signup } from './actions';
import Link from 'next/link';
import LoginMessage from './LoginMessage';
import { LoginButton } from './LoginButton';

export default function LoginPage() {
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
                             <form className="space-y-4" action={login}>
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input id="email-login" name="email" type="email" placeholder="you@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-login">Password</Label>
                                    <Input id="password-login" name="password" type="password" required />
                                </div>
                                <LoginButton />
                            </form>
                            <Button variant="link" size="sm" asChild className="p-0 h-auto w-full mt-2">
                                <Link href="/forgot-password">
                                    Forgot Password?
                                </Link>
                            </Button>
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
                            <form className="space-y-4" action={signup}>
                                <div className="space-y-2">
                                    <Label htmlFor="name-signup">Name</Label>
                                    <Input id="name-signup" name="name" type="text" placeholder="Your Name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" name="email" type="email" placeholder="you@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input id="password-signup" name="password" type="password" required minLength={6} />
                                </div>
                                <Button type="submit" className="w-full">Create Account</Button>
                                <p className="text-xs text-center text-muted-foreground pt-2">
                                    After signing up, you'll need to click the verification link sent to your email address to log in.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Suspense fallback={<div className="h-16 mt-4" />}>
                <LoginMessage />
            </Suspense>
        </div>
    );
}
