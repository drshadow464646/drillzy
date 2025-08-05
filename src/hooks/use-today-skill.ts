
"use client";

import { useMemo } from 'react';
import { useUserData } from '@/context/UserDataProvider';
import { format } from 'date-fns';
import type { Skill } from '@/lib/types';

export function useTodaySkill() {
    const { userData } = useUserData();

    const todayHistoryItem = useMemo(() => {
        if (!userData) return null;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        // The full skill object is now joined in the UserDataProvider
        return userData.skillHistory.find(item => item.date === todayStr);
    }, [userData]);
    
    // The full skill object is directly available
    const skill = todayHistoryItem?.skill;
    const skillId = todayHistoryItem?.skill_id;

    // The text comes directly from the skill object
    const skillText = skill?.text || '';
    const isCompleted = todayHistoryItem?.completed ?? false;
    const isNoSkillsLeft = skillId === "NO_SKILLS_LEFT";
    const isGenerating = !skillId || skillId === "GENERATING";

    return {
        skillText,
        isCompleted,
        isGenerating,
        isNoSkillsLeft,
        skillId
    };
}
