
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem, Skill } from '@/lib/types';
import { getNewSkill, getSkillById } from '@/lib/skills';
import { format } from 'date-fns';

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

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const initializeUser = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await migrateLocalStorageToSupabase(user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, category, streak_count')
        .eq('id', user.id)
        .single();

      if (profileError) console.error("Error fetching profile:", profileError);

      const { data: skillHistoryData, error: historyError } = await supabase
        .from('skill_history')
        .select('date, skill_id, completed')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (historyError) console.error("Error fetching skill history:", historyError);

      const enrichedHistory = skillHistoryData?.map(item => {
        const skill = getSkillById(item.skill_id);
        return { ...item, skill: skill! };
      }).filter(item => item.skill) || [];

      setUserData({
        id: user.id,
        name: profile?.name || user.user_metadata.name || 'Learner',
        category: profile?.category || null,
        skillHistory: enrichedHistory,
        streakCount: profile?.streak_count || 0,
      });

    } else {
      setUserData(null);
    }
    setIsLoading(false);
  }, [supabase]);

  const migrateLocalStorageToSupabase = async (userId: string) => {
    const localHistoryStr = localStorage.getItem(`skillHistory_${userId}`);
    if (!localHistoryStr) return;

    const { count } = await supabase
      .from('skill_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (count === 0) {
      const localHistory: { date: string; skillId: string; completed: boolean }[] = JSON.parse(localHistoryStr);
      const recordsToInsert = localHistory.map(item => ({
        user_id: userId,
        date: item.date,
        skill_id: item.skillId,
        completed: item.completed,
      }));

      if (recordsToInsert.length > 0) {
        await supabase.from('skill_history').insert(recordsToInsert);
      }
    }
    localStorage.removeItem(`skillHistory_${userId}`);
  };

  useEffect(() => {
    initializeUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') initializeUser();
      if (event === 'SIGNED_OUT') {
        setUserData(null);
        router.push('/login');
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase, router, initializeUser]);

  const assignSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (userData.skillHistory.some(item => item.date === todayStr)) return;

    const seenIds = userData.skillHistory.map(item => item.skill.id);
    const newSkill = getNewSkill(seenIds, userData.category || undefined);

    await supabase.from('skill_history').insert([{
      user_id: userData.id,
      date: todayStr,
      skill_id: newSkill ? newSkill.id : "NO_SKILLS_LEFT",
      completed: !newSkill,
    }]);
    await refreshUserData();
  }, [userData, supabase]);

  const burnSkill = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    await supabase.from('skill_history').delete().match({ user_id: userData.id, date: todayStr });

    const seenIds = userData.skillHistory.filter(item => item.date !== todayStr).map(item => item.skill.id);
    const newSkill = getNewSkill(seenIds, userData.category || undefined);

    await supabase.from('skill_history').insert([{
      user_id: userData.id,
      date: todayStr,
      skill_id: newSkill ? newSkill.id : "NO_SKILLS_LEFT",
      completed: !newSkill,
    }]);
    await refreshUserData();
  }, [userData, supabase]);
  
  const completeSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    await supabase.from('skill_history').update({ completed: true }).match({ user_id: userData.id, date: todayStr });
    await refreshUserData();
  }, [userData, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUserData = useCallback(async () => {
    await initializeUser();
  }, [initializeUser]);
  
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
