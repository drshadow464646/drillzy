
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { getNewSkillAction } from '@/app/(app)/actions';
import { format, subDays, parseISO } from 'date-fns';

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  burnSkill: () => Promise<void>;
  completeSkillForToday: () => Promise<void>;
  assignSkillForToday: () => void;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const calculateStreak = (history: SkillHistoryItem[]): number => {
    const completedDates = new Set(
        history.filter(h => h.completed).map(h => format(parseISO(h.date), 'yyyy-MM-dd'))
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
  const supabase = useMemo(() => createClient(), []);

  const initializeUser = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, category')
        .eq('id', user.id)
        .single();
      
      const { data: history, error: historyError } = await supabase
        .from('skill_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (historyError) {
        console.error("Error fetching skill history:", historyError);
      }
      
      const skillHistory = (history || []).map(item => ({
          ...item,
          date: format(parseISO(item.date), 'yyyy-MM-dd'),
      }));

      setUserData({
        id: user.id,
        name: profile?.name || user.user_metadata.name || 'Learner',
        category: profile?.category || null,
        skillHistory: skillHistory,
        streakCount: calculateStreak(skillHistory),
      });

    } else {
      setUserData(null);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    initializeUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                initializeUser();
            }
            if (event === 'SIGNED_OUT') {
                setUserData(null);
                router.push('/login');
            }
        }
    );
     return () => {
        authListener.subscription.unsubscribe();
    };
  }, [supabase, router, initializeUser]);

  const assignSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasSkillForToday = userData.skillHistory.some(item => item.date === todayStr);

    if (hasSkillForToday) return;

    const seenIds = userData.skillHistory.map(item => item.skill_id);
    const newSkill = await getNewSkillAction(seenIds, userData.category || undefined);

    const newSkillHistoryItem = {
        user_id: userData.id,
        date: todayStr,
        skill_id: newSkill ? newSkill.id : "NO_SKILLS_LEFT",
        completed: newSkill ? false : true,
    };

    const { data, error } = await supabase
      .from('skill_history')
      .insert(newSkillHistoryItem)
      .select()
      .single();

    if (error) {
        console.error("Error assigning skill:", error);
        return;
    }

    setUserData(prev => {
        if (!prev) return null;
        const newHistory = [data, ...prev.skillHistory];
        return { ...prev, skillHistory: newHistory };
    });
  }, [userData, supabase]);

  const burnSkill = useCallback(async () => {
      if (!userData) return;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const seenIds = userData.skillHistory.filter(item => item.date !== todayStr).map(item => item.skill_id);
      const newSkill = await getNewSkillAction(seenIds, userData.category || undefined);
      
      const newSkillId = newSkill ? newSkill.id : "NO_SKILLS_LEFT";
      const completed = !newSkill;

      const { data, error } = await supabase
        .from('skill_history')
        .update({ skill_id: newSkillId, completed: completed })
        .eq('user_id', userData.id)
        .eq('date', todayStr)
        .select()
        .single();
        
      if (error) {
          console.error("Error burning skill:", error);
          return;
      }

      await initializeUser(); // Re-fetch all data to ensure consistency
  }, [userData, supabase, initializeUser]);
  
  const completeSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
        .from('skill_history')
        .update({ completed: true })
        .eq('user_id', userData.id)
        .eq('date', todayStr)
        .select()
        .single();

    if (error) {
        console.error("Error completing skill:", error);
        return;
    }
    
    await initializeUser(); // Re-fetch to get updated streak count and history
  }, [userData, supabase, initializeUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const value = useMemo(() => ({
    userData,
    isLoading,
    signOut,
    burnSkill,
    completeSkillForToday,
    assignSkillForToday,
    refreshUserData: initializeUser
  }), [userData, isLoading, signOut, burnSkill, completeSkillForToday, assignSkillForToday, initializeUser]);

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
