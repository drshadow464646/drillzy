
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { generateSkill } from '@/ai/flows/generate-skill-flow';
import { format, subDays, parseISO, isToday } from 'date-fns';

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
  
  const performSkillGeneration = async (isBurn: boolean = false) => {
    if (!userData || !userData.category) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const existingSkills = userData.skillHistory
        .filter(item => !(isBurn && item.date === todayStr)) // Exclude today's skill if burning
        .map(item => item.skill_id);

    try {
        const { text } = await generateSkill({
            category: userData.category,
            existingSkills,
        });

        const { error } = await supabase
            .from('skill_history')
            .update({ skill_id: text, completed: false })
            .eq('user_id', userData.id)
            .eq('date', todayStr);

        if (error) throw error;
        
        setUserData(prev => {
            if (!prev) return null;
            const newHistory = prev.skillHistory.map(item =>
                item.date === todayStr ? { ...item, skill_id: text, completed: false } : item
            );
            return { ...prev, skillHistory: newHistory };
        });

    } catch (err) {
        console.error("Error generating or saving skill:", err);
         setUserData(prev => {
            if (!prev) return null;
            const newHistory = prev.skillHistory.map(item =>
                item.date === todayStr ? { ...item, skill_id: "Error generating skill. Please try again." } : item
            );
            return { ...prev, skillHistory: newHistory };
        });
    }
};


  const assignSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasSkillForToday = userData.skillHistory.some(item => item.date === todayStr);

    if (hasSkillForToday) return;

    // Create a placeholder record first
    const newSkillHistoryItem = {
        date: todayStr,
        skill_id: "GENERATING", // Placeholder text
        completed: false,
        user_id: userData.id
    };

    // Optimistically update UI
    setUserData(prev => {
        if (!prev) return null;
        // The type from Supabase might have more fields, so we just cast what we know.
        const optimisticHistoryItem = newSkillHistoryItem as SkillHistoryItem;
        const newHistory = [optimisticHistoryItem, ...prev.skillHistory];
        return { ...prev, skillHistory: newHistory };
    });

    const { error } = await supabase
      .from('skill_history')
      .insert(newSkillHistoryItem)
      .select()
      .single();

    if (error) {
        console.error("Error creating placeholder skill:", error);
        // Revert optimistic update
        refreshUserData();
        return;
    }
    
    // Now, generate the skill
    await performSkillGeneration();

  }, [userData, supabase, refreshUserData]);

  const burnSkill = useCallback(async () => {
      if (!userData) return;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      // Optimistically update the UI to show generating state
      setUserData(prev => {
          if (!prev) return null;
          const newHistory = prev.skillHistory.map(item => 
              item.date === todayStr ? { ...item, skill_id: "GENERATING", completed: false } : item
          );
          return { ...prev, skillHistory: newHistory };
      });
      
      // Generate the new skill
      await performSkillGeneration(true);

  }, [userData, supabase]);
  
  const completeSkillForToday = useCallback(async () => {
    if (!userData) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Optimistically update the UI
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
        // Revert the optimistic update on error
        refreshUserData();
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
