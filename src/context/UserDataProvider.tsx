
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { format, subDays, parseISO, isToday } from 'date-fns';
import { getSkillsByCategory, getSkillById } from '@/lib/skills-data';

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  burnSkill: () => Promise<void>;
  completeSkillForToday: () => Promise<void>;
  assignSkillForToday: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const calculateStreak = (history: SkillHistoryItem[]): number => {
    if (!history || history.length === 0) return 0;
    
    const completedDates = new Set(
        history.filter(h => h.completed).map(h => format(parseISO(h.date), 'yyyy-MM-dd'))
    );

    if (completedDates.size === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    // If today is not completed, start checking from yesterday
    if (!completedDates.has(format(currentDate, 'yyyy-MM-dd'))) {
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

  const refreshUserData = useCallback(async () => {
    // Keep it loading on initial fetch
    if (!userData) {
      setIsLoading(true);
    }
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

      const newUserData = {
        id: user.id,
        name: profile?.name || user.user_metadata.name || 'Learner',
        category: profile?.category || null,
        skillHistory: skillHistory,
        streakCount: calculateStreak(skillHistory),
      };

      setUserData(newUserData);

    } else {
      setUserData(null);
    }
    setIsLoading(false);
  }, [supabase, userData]);

  useEffect(() => {
    refreshUserData();
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                refreshUserData();
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
  }, [supabase, router, refreshUserData]);

  const assignSkillForToday = useCallback(async () => {
    if (!userData || !userData.category) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasSkillForToday = userData.skillHistory.some(item => item.date === todayStr);

    if (hasSkillForToday) {
        return;
    }

    setUserData(prev => prev ? ({ ...prev, skillHistory: [{date: todayStr, skill_id: "GENERATING", completed: false, user_id: prev.id }, ...prev.skillHistory] }) : null);

    const userCategorySkills = getSkillsByCategory(userData.category);
    const usedSkillIds = new Set(userData.skillHistory.map(h => h.skill_id));

    let newSkillId = "NO_SKILLS_LEFT";
    for (const skill of userCategorySkills) {
        if (!usedSkillIds.has(skill.id)) {
            newSkillId = skill.id;
            break;
        }
    }
    
    const newSkillHistoryItem: Omit<SkillHistoryItem, 'user_id'> & { user_id: string } = {
        date: todayStr,
        skill_id: newSkillId,
        completed: false,
        user_id: userData.id
    };

    const { error } = await supabase
      .from('skill_history')
      .insert(newSkillHistoryItem);

    if (error) {
        console.error("Error assigning new skill:", error);
    } 
    await refreshUserData();
}, [userData, supabase, refreshUserData]);

  const burnSkill = useCallback(async () => {
    console.warn("Shuffle/burn skill is disabled.");
  }, []);
  
  const completeSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    setUserData(prev => {
        if (!prev) return null;
        const newHistory = prev.skillHistory.map(item => 
            item.date === todayStr ? { ...item, completed: true } : item
        );
        const newStreak = calculateStreak(newHistory);
        return { ...prev, skillHistory: newHistory, streakCount: newStreak };
    });

    const { error } = await supabase
        .from('skill_history')
        .update({ completed: true })
        .eq('user_id', userData.id)
        .eq('date', todayStr);

    if (error) {
        console.error("Error completing skill:", error);
        refreshUserData(); // Revert on error
    }
  }, [userData, supabase, refreshUserData]);

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
    refreshUserData
  }), [userData, isLoading, signOut, burnSkill, completeSkillForToday, assignSkillForToday, refreshUserData]);

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

    