
"use client";

import { useUserData } from '@/context/UserDataProvider';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CalendarCheck, Flame, PieChart as PieChartIcon, Quote, Sparkles, Star, Trophy } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { DayModifiers } from 'react-day-picker';
import type { SkillHistoryItem } from '@/lib/types';
import { getSkillById } from '@/lib/skills-data';

const achievements = [
    { days: 3, label: "3-Day Spark", icon: Flame },
    { days: 7, label: "7-Day Star", icon: Star },
    { days: 14, label: "14-Day Award", icon: Award },
    { days: 30, label: "30-Day Trophy", icon: Trophy },
];

export default function StreakPage() {
  const { userData, isLoading } = useUserData();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [fromMonth, setFromMonth] = useState<Date | undefined>();
  const [toMonth, setToMonth] = useState<Date | undefined>();
  const [currentSkillText, setCurrentSkillText] = useState("Loading skill...");
  const [selectedSkillInfo, setSelectedSkillInfo] = useState<{date: string, text: string} | null>(null);
  
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    setFromMonth(twoMonthsAgo);
    setToMonth(now);
  }, []);

  const completedSkills = useMemo(() => {
    if (!userData) return [];
    return userData.skillHistory.filter(s => s.completed && s.skill_id !== 'NO_SKILLS_LEFT' && s.skill_id !== 'GENERATING');
  }, [userData]);

  useEffect(() => {
    if (!isClient || !userData || !userData.skillHistory.length) {
        setCurrentSkillText("Loading skill...");
        return;
    };
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayHistoryItem = userData.skillHistory.find(item => item.date === todayStr);
    
    if (!todayHistoryItem) {
        setCurrentSkillText("Go to the Home screen to get your skill for today!");
        return;
    }

    if (todayHistoryItem.skill_id === "NO_SKILLS_LEFT" || todayHistoryItem.skill_id === "GENERATING") {
        setCurrentSkillText("Generating your skill on the Home screen...");
        return;
    }
    
    const skill = getSkillById(todayHistoryItem.skill_id);
    setCurrentSkillText(skill?.text || "Skill not found.");
  }, [userData, isClient]);

  const completedDays = useMemo(() => {
    if (!isClient || !userData) return [];
    return userData.skillHistory
        .filter(item => item.completed && item.skill_id !== "NO_SKILLS_LEFT" && item.skill_id !== 'GENERATING')
        .map(item => parseISO(item.date));
  }, [userData, isClient]);

  useEffect(() => {
    if (!selectedDay || !userData) {
        setSelectedSkillInfo(null);
        return;
    };
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    const historyItem = userData.skillHistory.find(item => item.date === dateStr && item.completed);
    if (historyItem && historyItem.skill_id !== 'NO_SKILLS_LEFT' && historyItem.skill_id !== 'GENERATING') {
        const skill = getSkillById(historyItem.skill_id);
        setSelectedSkillInfo({
            date: format(selectedDay, 'PPP'),
            text: skill?.text || "Skill not found."
        });
    } else {
        setSelectedSkillInfo(null);
    }
  }, [selectedDay, userData]);


  const handleDayClick = (day: Date, modifiers: DayModifiers) => {
    if (modifiers.selected) {
      if (selectedDay && isSameDay(day, selectedDay)) {
        setSelectedDay(undefined);
      } else {
        setSelectedDay(day);
      }
    } else {
      setSelectedDay(undefined);
    }
  };

  if (!isClient || isLoading || !userData) {
    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen">
            <header className="py-4 text-center">
                <Skeleton className="h-10 w-64 mx-auto" />
            </header>
            <main className="max-w-4xl mx-auto grid gap-8 mt-6">
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl md:col-span-2" />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </main>
        </div>
    );
  }

  const modifiers = {
    selected: completedDays,
    ...(selectedDay && { clicked: selectedDay }),
  };

  const modifiersClassNames = {
    selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
    today: "bg-accent text-accent-foreground",
    clicked: "ring-2 ring-accent ring-offset-background",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="py-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Progress</h1>
      </header>
      
      <main className="max-w-4xl mx-auto grid gap-8 mt-6">
        
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg rounded-xl md:col-span-1 flex flex-col items-center justify-center p-6 text-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent to-pink-500">{userData.streakCount}</span>
                    <Flame className="h-12 w-12 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
            </Card>

            <Card className="shadow-lg rounded-xl md:col-span-2">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Skill</CardTitle>
                     <CalendarCheck className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-semibold">{currentSkillText}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
                <Card className="w-full shadow-lg rounded-xl p-0 overflow-hidden">
                   <div className="flex justify-center">
                      <Calendar
                          mode="multiple"
                          selected={completedDays}
                          onDayClick={handleDayClick}
                          modifiers={modifiers}
                          modifiersClassNames={modifiersClassNames}
                          fromMonth={fromMonth}
                          toMonth={toMonth}
                          className="p-3"
                          classNames={{
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                              day_today: "bg-accent/50 text-accent-foreground",
                              day_outside: "text-muted-foreground opacity-50",
                          }}
                      />
                    </div>
                </Card>
                
                {selectedSkillInfo && (
                  <Card className="shadow-lg rounded-xl animate-in fade-in duration-300">
                      <CardHeader className="flex-row items-center gap-4">
                          <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
                          <div className="flex-grow">
                              <CardTitle className="text-lg">Skill for {selectedSkillInfo.date}</CardTitle>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <p className="text-lg font-medium">{selectedSkillInfo.text}</p>
                      </CardContent>
                  </Card>
                )}

                 <Card className="shadow-lg rounded-xl bg-primary/5 border-primary/20">
                    <CardHeader className="flex-row items-start gap-4">
                        <Quote className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-grow">
                            <CardTitle className="text-lg text-primary font-mono">Fixed Motivation</CardTitle>
                            <CardContent className="p-0 pt-2">
                                <p className="italic text-primary/80 font-serif">"Don't Die ~ Developer"</p>
                            </CardContent>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="space-y-8">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Streak Milestones</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {achievements.map((ach) => {
                            const isUnlocked = userData.streakCount >= ach.days;
                            return (
                                <div key={ach.days} className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-accent/20 border-accent/30 border' : 'bg-muted/30 opacity-60'}`}>
                                    <ach.icon className={`h-10 w-10 transition-colors ${isUnlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                                    <span className="text-sm font-semibold">{ach.label}</span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
                
                 <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Completed Skill History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {completedSkills.length > 0 ? (
                             <ul className="space-y-4 max-h-[24rem] overflow-y-auto pr-2">
                                {completedSkills
                                    .slice(0, 10)
                                    .map((item) => (
                                        <CompletedSkillItem key={`${item.date}-${item.skill_id}`} item={item} />
                                    ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No skills completed yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}

function CompletedSkillItem({ item }: { item: SkillHistoryItem }) {
    if (!item || !item.skill_id || item.skill_id === 'NO_SKILLS_LEFT' || item.skill_id === 'GENERATING') {
        return null;
    }
    const skill = getSkillById(item.skill_id);
    if (!skill) return null;

    return (
        <li className="flex flex-col border-b pb-2 last:border-none">
            <span className="text-sm font-semibold text-foreground">{skill.text}</span>
            <span className="text-xs text-muted-foreground">{format(parseISO(item.date), 'PPP')}</span>
        </li>
    );
}
