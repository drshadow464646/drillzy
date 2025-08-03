
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signup } from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const searchParams = useSearchParams();
<<<<<<< HEAD
    const message = searchParams.get('message');
=======
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(searchParams.get('message') || '');
    const [authRedirectTo, setAuthRedirectTo] = useState('');

    useEffect(() => {
        const isNative = Capacitor.isNativePlatform();
        const webCallback = `${window.location.origin}/home`;
        const nativeCallback = 'drillzy://auth/callback';
        setAuthRedirectTo(isNative ? nativeCallback : webCallback);
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
        if (!authRedirectTo) {
            setMessage('Could not determine redirect URL. Please try again.');
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: authRedirectTo,
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
        if (!authRedirectTo) {
            setMessage('Could not determine redirect URL. Please try again.');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // This must be an authorized URL in your Supabase project settings
            redirectTo: authRedirectTo,
        });

        if (error) {
            if (error.message.toLowerCase().includes('error sending')) {
                setMessage('Error sending password reset email. This might be due to email provider configuration issues in your Supabase project. Please ensure that you have a custom SMTP provider configured and that the redirect URL is whitelisted in your Supabase project settings.');
            } else {
                setMessage(`Error: ${error.message}`);
            }
        } else {
            setMessage('Password reset link sent! Please check your email.');
        }
    };
>>>>>>> f9b7a8af38a528beeff8136fb285742ddfe23e02

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
                                <Button type="submit" className="w-full">Login</Button>
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
                                    <Input id="password-signup" name="password" type="password" required />
                                </div>
                                <Button type="submit" className="w-full">Create Account</Button>
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
