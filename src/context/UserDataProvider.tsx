
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { getNewSkill } from '@/lib/skills';
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
      // Migrate data from localStorage if necessary
      await migrateLocalStorageToSupabase(user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, category, streak_count')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      const { data: skillHistory, error: historyError } = await supabase
        .from('skill_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (historyError) {
        console.error("Error fetching skill history:", historyError);
      }

      setUserData({
        id: user.id,
        name: profile?.name || user.user_metadata.name || 'Learner',
        category: profile?.category || null,
        skillHistory: skillHistory || [],
        streakCount: profile?.streak_count || 0,
      });

    } else {
      setUserData(null);
    }
    setIsLoading(false);
  }, [supabase]);

  const migrateLocalStorageToSupabase = async (userId: string) => {
    const localHistoryStr = localStorage.getItem(`skillHistory_${userId}`);
    if (!localHistoryStr) return; // No local data to migrate

    const { data: remoteHistory, count } = await supabase
      .from('skill_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (count === 0) {
      const localHistory: SkillHistoryItem[] = JSON.parse(localHistoryStr);
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
    // Once migrated, remove from local storage
    localStorage.removeItem(`skillHistory_${userId}`);
  };

  useEffect(() => {
    initializeUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
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

    const seenIds = userData.skillHistory.map(item => item.skillId);
    const newSkill = getNewSkill(seenIds, userData.category || undefined);
    const newSkillHistoryItem = {
      user_id: userData.id,
      date: todayStr,
      skill_id: newSkill ? newSkill.id : "NO_SKILLS_LEFT",
      completed: newSkill ? false : true,
    };

    const { error } = await supabase.from('skill_history').insert([newSkillHistoryItem]);
    if (!error) {
      await refreshUserData();
    }
  }, [userData, supabase]);

  const burnSkill = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // First, delete today's skill if it exists
    await supabase.from('skill_history').delete().match({ user_id: userData.id, date: todayStr });

    // Then, assign a new one
    const seenIds = userData.skillHistory.filter(item => item.date !== todayStr).map(item => item.skillId);
    const newSkill = getNewSkill(seenIds, userData.category || undefined);
    const newSkillHistoryItem = {
      user_id: userData.id,
      date: todayStr,
      skill_id: newSkill ? newSkill.id : "NO_SKILLS_LEFT",
      completed: newSkill ? false : true,
    };

    const { error } = await supabase.from('skill_history').insert([newSkillHistoryItem]);
    if (!error) {
      await refreshUserData();
    }
  }, [userData, supabase]);
  
  const completeSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { error } = await supabase
      .from('skill_history')
      .update({ completed: true })
      .match({ user_id: userData.id, date: todayStr });

    if (!error) {
      await refreshUserData();
    }
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
