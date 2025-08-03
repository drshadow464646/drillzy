
"use client";

import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getSkillById } from '@/lib/skills';
import type { SkillHistoryItem } from '@/lib/types';
import { allSkills } from '@/lib/skills';

interface SkillRadarChartProps {
    history: SkillHistoryItem[];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ history }) => {
    const categoryData = React.useMemo(() => {
        const counts = {
            thinker: 0,
            builder: 0,
            creator: 0,
            connector: 0,
        };

        const completedSkills = history
          .filter(item => item.completed && item.skillId !== 'NO_SKILLS_LEFT')
          .map(item => getSkillById(item.skillId))
          .filter(Boolean);
        
        // This is a placeholder for now until we have categories for skills.
        completedSkills.forEach((skill, index) => {
            const category = ['thinker', 'builder', 'creator', 'connector'][index % 4];
            counts[category as keyof typeof counts]++;
        });
        
        const maxCount = Math.max(...Object.values(counts), 3);

        return {
            data: [
                { subject: 'Thinker', count: counts.thinker, fullMark: maxCount },
                { subject: 'Creator', count: counts.creator, fullMark: maxCount },
                { subject: 'Builder', count: counts.builder, fullMark: maxCount },
                { subject: 'Connector', count: counts.connector, fullMark: maxCount },
            ],
            total: Object.values(counts).reduce((sum, count) => sum + count, 0)
        }
    }, [history]);

    if (categoryData.total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground font-semibold">No skills completed yet!</p>
                <p className="text-sm text-muted-foreground mt-1">Complete your first skill to see your profile grow.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData.data}>
                <defs>
                    <radialGradient id="radar-fill">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </radialGradient>
                </defs>
                <PolarGrid stroke="hsl(var(--border))"/>
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                <Radar
                    name="Skills"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="url(#radar-fill)"
                    fillOpacity={0.8}
                    strokeWidth={2}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background) / 0.8)',
                        backdropFilter: 'blur(4px)',
                    }}
                    cursor={{
                        stroke: 'hsl(var(--primary))',
                        strokeWidth: 1,
                        strokeDasharray: '3 3',
                    }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default SkillRadarChart;
