
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserData, SkillHistoryItem, Category, SurveyAnswer } from '@/lib/types';
import { getNewSkill } from '@/lib/skills';
import { format, subDays } from 'date-fns';
import { calculateSkillProfile } from '@/ai/flows/calculate-skill-profile';

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  burnSkill: () => Promise<void>;
  completeSkillForToday: () => Promise<void>;
  assignSkillForToday: () => void;
  handleSurveySubmission: (answers: SurveyAnswer[]) => Promise<{ success: boolean; error: string | null; category: Category | null; }>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const calculateStreak = (history: SkillHistoryItem[]): number => {
    const completedDates = new Set(
        history.filter(h => h.completed).map(h => h.date)
    );

    if (completedDates.size === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(currentDate, 1), 'yyyy-MM-dd');

    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
        return 0;
    }

    if (!completedDates.has(todayStr)) {
        currentDate = subDays(currentDate, 1);
    }
    
    while (true) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (completedDates.has(dateStr)) {
            streak++;
            currentDate = subDays(currentDate, 1);
        } else {
            break; 
        }
    }
    return streak;
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const fetchFullUserData = useCallback(async (user: User) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, category')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching profile:", error);
      setUserData({
        id: user.id,
        name: user.user_metadata.name || 'Learner',
        category: null,
        skillHistory: [], 
        streakCount: 0,
      });
      return;
    }

    const localHistoryStr = localStorage.getItem(`skillHistory_${user.id}`);
    const localHistory: SkillHistoryItem[] = localHistoryStr ? JSON.parse(localHistoryStr) : [];
    
    setUserData({
      id: user.id,
      name: profile?.name || user.user_metadata.name || 'Learner',
      category: profile?.category || null,
      skillHistory: localHistory,
      streakCount: calculateStreak(localHistory),
    });
  }, [supabase]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        await fetchFullUserData(currentUser);
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchFullUserData]);


  useEffect(() => {
    if (userData) {
      localStorage.setItem(`skillHistory_${userData.id}`, JSON.stringify(userData.skillHistory));
    }
  }, [userData]);


  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith('/login');
    const isSurveyPage = pathname.startsWith('/survey');
    const isSplashPage = pathname === '/';

    if (!userData && !isAuthPage) {
      router.replace('/login');
    } else if (userData) {
      if (isAuthPage || isSplashPage) {
        if (!userData.category) {
            router.replace('/survey');
        } else {
            router.replace('/home');
        }
      } else if (!userData.category && !isSurveyPage) {
        router.replace('/survey');
      } else if (userData.category && isSurveyPage) {
        router.replace('/home');
      }
    }
  }, [userData, isLoading, pathname, router]);


  const assignSkillForToday = useCallback(() => {
    setUserData(prev => {
        if (!prev) return prev;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const hasSkillForToday = prev.skillHistory.some(item => item.date === todayStr);
        if (hasSkillForToday) return prev;
        const seenIds = prev.skillHistory.map(item => item.skillId);
        const newSkill = getNewSkill(seenIds);
        const newSkillHistoryItem: SkillHistoryItem = newSkill
            ? { date: todayStr, skillId: newSkill.id, completed: false }
            : { date: todayStr, skillId: "NO_SKILLS_LEFT", completed: true };
        const newHistory = [newSkillHistoryItem, ...prev.skillHistory];
        return { ...prev, skillHistory: newHistory };
    });
  }, []);

  const burnSkill = useCallback(async () => {
    setUserData(prev => {
      if (!prev) return prev;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const historyWithoutToday = prev.skillHistory.filter(item => item.date !== todayStr);
      const seenIds = historyWithoutToday.map(item => item.skillId);
      const newSkill = getNewSkill(seenIds);
      const newSkillHistoryItem: SkillHistoryItem = newSkill
          ? { date: todayStr, skillId: newSkill.id, completed: false }
          : { date: todayStr, skillId: "NO_SKILLS_LEFT", completed: true };
      const newHistory = [newSkillHistoryItem, ...historyWithoutToday];
      return { ...prev, skillHistory: newHistory };
    });
  }, []);
  
  const completeSkillForToday = useCallback(async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setUserData(prev => {
        if (!prev) return null;
        const newHistory = prev.skillHistory.map(item => 
            item.date === todayStr ? { ...item, completed: true } : item
        );
        const newStreakCount = calculateStreak(newHistory);
        return { ...prev, skillHistory: newHistory, streakCount: newStreakCount };
    });
  }, []);

  const handleSurveySubmission = async (answers: SurveyAnswer[]): Promise<{ success: boolean; error: string | null; category: Category | null; }> => {
    if (!userData) {
        return { success: false, error: 'User not authenticated.', category: null };
    }
    try {
      // Call the Genkit flow to get the category from the AI.
      const { category } = await calculateSkillProfile(answers);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ category: category })
        .eq('id', userData.id);

      if (profileError) throw profileError;
      
      setUserData(prev => prev ? { ...prev, category } : null);
      
      return { success: true, error: null, category };
    } catch (error) {
      console.error('Error submitting survey:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: `Failed to save profile: ${errorMessage}`, category: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  const value = useMemo(() => ({
    userData,
    isLoading,
    signOut,
    burnSkill,
    completeSkillForToday,
    assignSkillForToday,
    handleSurveySubmission,
  }), [userData, isLoading, signOut, burnSkill, completeSkillForToday, assignSkillForToday, handleSurveySubmission]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
