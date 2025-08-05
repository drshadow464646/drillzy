
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
        return userData.skillHistory.find(item => item.date === todayStr);
    }, [userData]);
    
    const skill = todayHistoryItem?.skill;
    const skillId = todayHistoryItem?.skill_id;

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
