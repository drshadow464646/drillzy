
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useUserData } from '@/context/UserDataProvider';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Skill } from '@/lib/types';

export function useTodaySkill() {
    const { userData } = useUserData();
    const [skill, setSkill] = useState<Skill | null>(null);
    const supabase = useMemo(() => createClient(), []);

    const todayHistoryItem = useMemo(() => {
        if (!userData) return null;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        return userData.skillHistory.find(item => item.date === todayStr);
    }, [userData]);

    const skillId = todayHistoryItem?.skill_id;

    useEffect(() => {
        const fetchSkill = async () => {
            if (skillId && skillId !== 'NO_SKILLS_LEFT' && skillId !== 'GENERATING') {
                const { data, error } = await supabase
                    .from('skills')
                    .select('*')
                    .eq('id', skillId)
                    .single();
                
                if (error) {
                    console.error("Error fetching skill by ID:", error);
                    setSkill(null);
                } else {
                    setSkill(data);
                }
            } else {
                setSkill(null);
            }
        };

        fetchSkill();
    }, [skillId, supabase]);

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
