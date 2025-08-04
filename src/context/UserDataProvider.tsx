
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { generateSkill } from '@/ai/flows/generate-skill';
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
      
      const skillHistory = history || [];

      // Call the new SQL function to calculate the streak
      const { data: streakCount, error: streakError } = await supabase.rpc('calculate_streak', { user_id_param: user.id });

      if (streakError) {
        console.error("Error fetching streak:", streakError);
      }

      setUserData({
        id: user.id,
        name: profile?.name || user.user_metadata.name || 'Learner',
        category: profile?.category || null,
        skillHistory: skillHistory as SkillHistoryItem[],
        streakCount: streakCount || 0,
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
    if (!userData || !userData.category) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasSkillForToday = userData.skillHistory.some(item => item.date === todayStr);

    if (hasSkillForToday) return;

    setIsLoading(true);
    const history = userData.skillHistory.map(item => item.skill_id);
    const { skill } = await generateSkill({ category: userData.category, history });

    const newSkillHistoryItem = {
        user_id: userData.id,
        date: todayStr,
        skill_id: skill,
        completed: false,
    };

    const { error } = await supabase
      .from('skill_history')
      .insert(newSkillHistoryItem);

    if (error) {
        console.error("Error assigning skill:", error);
    }

    await initializeUser();
  }, [userData, supabase, initializeUser]);

  const burnSkill = useCallback(async () => {
    if (!userData || !userData.category) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    setIsLoading(true);
    const history = userData.skillHistory.map(item => item.skill_id);
    const { skill } = await generateSkill({ category: userData.category, history });

    const { error } = await supabase
      .from('skill_history')
      .update({ skill_id: skill, completed: false })
      .eq('user_id', userData.id)
      .eq('date', todayStr);

    if (error) {
        console.error("Error burning skill:", error);
    }

    await initializeUser();
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
