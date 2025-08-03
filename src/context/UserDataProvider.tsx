
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserData, SkillHistoryItem } from '@/lib/types';
import { getNewSkill } from '@/lib/skills';
import { format, subDays } from 'date-fns';

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  burnSkill: () => Promise<void>;
  completeSkillForToday: () => Promise<void>;
  assignSkillForToday: () => void;
  setInitialData: (data: UserData) => void;
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
  const supabase = useMemo(() => createClient(), []);

  const setInitialData = useCallback((data: UserData) => {
    const localHistoryStr = localStorage.getItem(`skillHistory_${data.id}`);
    const localHistory: SkillHistoryItem[] = localHistoryStr ? JSON.parse(localHistoryStr) : [];
    
    setUserData({
      ...data,
      skillHistory: localHistory,
      streakCount: calculateStreak(localHistory),
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (userData) {
      localStorage.setItem(`skillHistory_${userData.id}`, JSON.stringify(userData.skillHistory));
    }
  }, [userData]);

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

  const signOut = async () => {
    await supabase.auth.signOut();
    // Use window.location to force a full page reload to clear server components
    window.location.href = '/login';
  };
  
  const value = useMemo(() => ({
    userData,
    isLoading,
    signOut,
    burnSkill,
    completeSkillForToday,
    assignSkillForToday,
    setInitialData,
  }), [userData, isLoading, signOut, burnSkill, completeSkillForToday, assignSkillForToday, setInitialData]);

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
