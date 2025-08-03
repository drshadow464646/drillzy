
"use client";

import { useUserData } from '@/context/UserDataProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator';
import { Palette, Sparkles, Waves, Type, Sun, Moon, Laptop, LogOut, Settings as SettingsIcon, User, Bell, Clock, BellRing, Layers, Sunrise, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeProvider';
import { checkPermissions, requestPermissions, scheduleDailyNotification } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { updateUserName } from './actions';


export default function SettingsPage() {
    const { userData, isLoading, signOut, refreshUserData } = useUserData();
    const { 
        theme: mode, 
        setTheme: setMode, 
        motionLevel, 
        setMotionLevel, 
        font, 
        setFont,
        baseTheme,
        setBaseTheme
    } = useTheme();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
    const [name, setName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const { toast } = useToast();
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIsNative(Capacitor.isNativePlatform());
    }, []);

    const updatePermissionStatus = async () => {
        if (isNative) {
            const granted = await checkPermissions();
            setHasNotificationPermission(granted);
            if (granted) {
                const storedTime = localStorage.getItem('reminderTime') || "09:00";
                setReminderTime(storedTime);
            }
        }
    };

    useEffect(() => {
        updatePermissionStatus();
    }, [isNative]);

    useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
    }, [userData?.name]);

    const handleSaveName = async () => {
        if (name === userData?.name || !name.trim()) return;
        setIsSavingName(true);
        const { error } = await updateUserName(name);
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            });
        } else {
            await refreshUserData();
            toast({
                title: 'Success!',
                description: 'Your name has been updated.',
            });
        }
        setIsSavingName(false);
    };

    const handlePermissionRequest = async () => {
        const granted = await requestPermissions();
        setHasNotificationPermission(granted);
        toast({
            title: granted ? "Permissions Granted" : "Permissions Denied",
            description: granted ? "You can now set daily reminders." : "You can enable notifications from your device settings.",
            variant: granted ? "default" : "destructive",
        });
        if (granted) {
            handleTimeChange(null, reminderTime); // Schedule with current time
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement> | null, newTime?: string) => {
        const timeToSet = newTime || (e ? e.target.value : "09:00");
        setReminderTime(timeToSet);
        localStorage.setItem('reminderTime', timeToSet);
        if (hasNotificationPermission) {
            scheduleDailyNotification(timeToSet).then(success => {
                if (success) {
                    toast({
                        title: "Reminder Updated",
                        description: `Your daily threatening message will arrive at ${timeToSet}.`,
                    });
                } else {
                     toast({
                        title: "Error",
                        description: "Could not schedule reminder.",
                        variant: "destructive",
                    });
                }
            });
        }
    }

    if (!isClient || isLoading || !userData) {
        return (
            <div className="p-4 min-h-screen">
                <div className="max-w-3xl mx-auto">
                    <header className="py-4">
                        <Skeleton className="h-10 w-80 mb-2" />
                        <Skeleton className="h-6 w-full max-w-lg" />
                    </header>
                    <main className="mt-6 space-y-8">
                        <Skeleton className="h-56 w-full rounded-lg" />
                        <Skeleton className="h-96 w-full rounded-lg" />
                        <div className="pt-4">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const isNameChanged = name !== userData.name;

    return (
        <div className="p-4 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <header className="py-4">
                     <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Drillzy Settings</h1>
                    <p className="text-md sm:text-lg text-muted-foreground mt-1">
                        Fine-tune your skill tracking experience. Adjust preferences and personalize your interface.
                    </p>
                </header>

                <main className="mt-6 space-y-8">
                    {/* Profile Settings Card */}
                    <div className="space-y-6 bg-card border rounded-lg p-6">
                        <div className="flex items-center gap-4">
                            <User className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold">Profile Settings</h2>
                        </div>
                        <Separator />
                        
                        {/* User Name */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                            <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">Your Name</h3>
                                <p className="text-muted-foreground text-sm">This is how your name will appear on the leaderboard.</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full sm:w-[220px]" />
                                {isNameChanged && (
                                    <Button onClick={handleSaveName} disabled={isSavingName} size="icon">
                                        {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isNative && (
                         <div className="space-y-6 bg-card border rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <Bell className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">Notifications</h2>
                            </div>
                            <Separator />
                             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">Reminder Time</h3>
                                    <p className="text-muted-foreground text-sm">Set a time for your daily threatening reminder.</p>
                                </div>
                                <Input type="time" value={reminderTime} onChange={handleTimeChange} className="w-full sm:w-[220px]" disabled={!hasNotificationPermission} />
                            </div>

                            {!hasNotificationPermission && (
                                <>
                                <Separator />
                                 <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                                    <BellRing className="h-8 w-8 text-accent flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-accent-foreground">Enable Reminders</h3>
                                        <p className="text-muted-foreground text-sm">Grant notification permissions to get daily reminders.</p>
                                    </div>
                                    <Button onClick={handlePermissionRequest} className="bg-accent text-accent-foreground hover:bg-accent/90">Enable</Button>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Aesthetic & Interface Card */}
                    <div className="space-y-6 bg-card border rounded-lg p-6">
                        <div className="flex items-center gap-4">
                            <Palette className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold">Aesthetic & Interface</h2>
                        </div>
                        <Separator />

                        {/* Appearance Mode */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                            <Sparkles className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">Appearance Mode</h3>
                                <p className="text-muted-foreground text-sm">Choose between light and dark mode.</p>
                            </div>
                            <RadioGroup value={mode} onValueChange={setMode} className="flex items-center gap-2 sm:gap-4">
                               <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="light" id="theme-light" />
                                    <Label htmlFor="theme-light" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Sun className="h-4 w-4" /> Light
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dark" id="theme-dark" />
                                    <Label htmlFor="theme-dark" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Moon className="h-4 w-4" /> Dark
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="system" id="theme-system" />
                                    <Label htmlFor="theme-system" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Laptop className="h-4 w-4" /> System
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        <Separator />

                        {/* Base Gradient */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                            <Layers className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">Base Gradient</h3>
                                <p className="text-muted-foreground text-sm">Choose the background gradient for the app.</p>
                            </div>
                            <RadioGroup value={baseTheme} onValueChange={(val) => setBaseTheme(val as any)} className="flex items-center gap-2 sm:gap-4">
                               <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="moon" id="theme-moon" />
                                    <Label htmlFor="theme-moon" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Moon className="h-4 w-4" /> Moon
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sunset" id="theme-sunset" />
                                    <Label htmlFor="theme-sunset" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Sun className="h-4 w-4" /> Sunset
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dawn" id="theme-dawn" />
                                    <Label htmlFor="theme-dawn" className="flex items-center gap-2 font-normal cursor-pointer">
                                        <Sunrise className="h-4 w-4" /> Dawn
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Separator />
                        
                        {/* UI Motion Level */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                            <Waves className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">UI Motion Level</h3>
                                <p className="text-muted-foreground text-sm">Adjust animation intensity. 'Low' reduces most animations.</p>
                            </div>
                             <Select value={motionLevel} onValueChange={setMotionLevel as any}>
                                <SelectTrigger className="w-full sm:w-[220px]">
                                    <SelectValue placeholder="Motion Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        {/* Typography Mode */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                            <Type className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">Typography Mode</h3>
                                <p className="text-muted-foreground text-sm">Choose your preferred font style for the application.</p>
                            </div>
                            <Select value={font} onValueChange={setFont as any}>
                                <SelectTrigger className="w-full sm:w-[220px]">
                                    <SelectValue placeholder="Font Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default (Sans-serif)</SelectItem>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="mono">Monospace</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {/* Danger Zone */}
                    <div className="pt-4">
                        <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
                        <div className="mt-4 p-4 border-2 border-destructive/50 rounded-lg bg-destructive/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h4 className="font-semibold text-lg">Sign Out</h4>
                                <p className="text-sm text-muted-foreground max-w-md">You will be returned to the login screen.</p>
                            </div>
                            <Button size="lg" variant="destructive" className="flex-shrink-0" onClick={signOut}>
                                <LogOut className="mr-2 h-5 w-5" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

    