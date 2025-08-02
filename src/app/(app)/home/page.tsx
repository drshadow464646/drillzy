
"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUserData } from '@/context/UserDataProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CornerDownRight, Check, BrainCircuit, BarChartHorizontal, TrendingUp, Lightbulb, BellRing } from 'lucide-react';
import { getSkillById } from '@/lib/skills';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { SkillHistoryItem } from '@/lib/types';
import WeeklyProgressChart from '@/components/WeeklyProgressChart';
import CumulativeSkillsChart from '@/components/CumulativeSkillsChart';
import { checkPermissions, requestPermissions, scheduleDailyNotification } from '@/lib/notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

function NotificationPrompt() {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const { toast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkPermissions().then(granted => {
        if (granted) {
          setPermissionStatus('granted');
        } else {
          const dismissed = localStorage.getItem('notification_prompt_dismissed') === 'true';
          setPermissionStatus(dismissed ? 'denied' : 'prompt');
        }
      });
    } else {
      setPermissionStatus('denied'); // Don't show on web
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      const defaultTime = "09:00";
      await scheduleDailyNotification(defaultTime);
      localStorage.setItem('reminderTime', defaultTime);
      toast({
        title: "Reminders Enabled!",
        description: `We'll remind you daily at ${defaultTime}. You can change this in settings.`,
      });
      setPermissionStatus('granted');
    } else {
      toast({
        title: "Permissions Denied",
        description: "You can enable notifications later from the settings page.",
        variant: "destructive",
      });
       handleDismiss(); // If they deny, treat it as dismissed
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification_prompt_dismissed', 'true');
    setPermissionStatus('denied');
  }

  if (permissionStatus !== 'prompt') return null;

  return (
    <Card className="w-full max-w-2xl shadow-xl rounded-2xl bg-accent/20 border-accent/30 mt-8 animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BellRing className="h-6 w-6 text-accent-foreground" />
          <span className="text-accent-foreground">Don't Lose Your Streak!</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">Enable daily reminders to stay on track. We'll send you one of our famously "motivating" messages.</p>
        <div className="flex gap-4">
          <Button onClick={handleEnableNotifications} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">Enable Reminders</Button>
          <Button onClick={handleDismiss} variant="ghost" className="flex-1">Maybe Later</Button>
        </div>
      </CardContent>
    </Card>
  )
}


export default function HomePage() {
  const { userData, isLoading, burnSkill, completeSkillForToday, assignSkillForToday } = useUserData();
  const router = useRouter();
  const hasAssignedSkill = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userData && !hasAssignedSkill.current && isClient) {
        assignSkillForToday();
        hasAssignedSkill.current = true;
    }
  }, [userData, assignSkillForToday, isClient]);

  const todayHistoryItem = useMemo(() => {
    if (!userData || !isClient) return null;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return userData.skillHistory.find(item => item.date === todayStr);
  }, [userData, isClient]);

  const skillText = useMemo(() => {
      if (!todayHistoryItem) return '';
      if (todayHistoryItem.skillId === "NO_SKILLS_LEFT") return "You've unlocked all skills! 🏆";
      const skill = getSkillById(todayHistoryItem.skillId);
      return skill?.text || '';
  }, [todayHistoryItem]);

  const isCompleted = todayHistoryItem?.completed ?? false;
  const isNoSkillsLeft = todayHistoryItem?.skillId === "NO_SKILLS_LEFT";

  if (isLoading || !userData || !isClient) {
    return (
      <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 min-h-screen">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-48 w-full max-w-2xl mb-6" />
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full md:col-span-2" />
        </div>
      </div>
    );
  }

  const greeting = `Hey, ${userData.name}!`;
  
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 min-h-screen text-center animate-in fade-in duration-500">
       <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">{greeting}</h1>
        <div className="flex items-center gap-2 text-accent-foreground font-bold bg-accent/90 rounded-full px-4 py-2 shadow-lg shadow-accent/20">
          <Zap className="h-5 w-5" fill="currentColor" />
          <span>{userData.streakCount} Day Streak</span>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center w-full max-w-4xl mt-8">
        
        {isClient && <NotificationPrompt />}

        <Card className="w-full max-w-2xl shadow-xl rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground font-semibold">
                <Lightbulb className="h-5 w-5" />
                Today's Skill
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
            {skillText ? (
                 <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    {skillText}
                </p>
            ) : (
                <Skeleton className="h-8 w-3/4" />
            )}
          </CardContent>
        </Card>

        <div className="w-full max-w-2xl mt-6">
            {isCompleted ? (
                 <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-400 bg-green-500/10 rounded-full py-3 px-6 animate-in fade-in duration-300">
                    <Check className="h-6 w-6" />
                    <span>Great job! Skill completed.</span>
                </div>
            ) : !isNoSkillsLeft && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                     <Button size="lg" className="h-14 text-lg font-bold shadow-lg shadow-primary/20" onClick={completeSkillForToday}>
                        <Check className="h-6 w-6 mr-2"/>
                        Mark as Done
                    </Button>
                    <Button variant="ghost" size="lg" className="h-14 text-lg font-semibold" onClick={burnSkill}>
                        <CornerDownRight className="h-6 w-6 mr-2"/>
                        Shuffle Skill
                    </Button>
                </div>
            )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 w-full mt-12">
            <Card className="shadow-lg rounded-xl md:col-span-2">
                <CardHeader className="flex-row items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg">Cumulative Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center pt-4">
                   <CumulativeSkillsChart history={userData.skillHistory as SkillHistoryItem[]} />
                </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl md:col-span-2">
                <CardHeader className="flex-row items-center gap-4">
                    <BarChartHorizontal className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg">Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                   <WeeklyProgressChart history={userData.skillHistory as SkillHistoryItem[]} />
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
