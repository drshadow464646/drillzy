
"use client";

import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { SkillHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface SkillRadarChartProps {
    history: SkillHistoryItem[];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ history }) => {
    
    const chartData = React.useMemo(() => {
        const counts: { [key: string]: number } = {
            Thinker: 0,
            Builder: 0,
            Creator: 0,
            Connector: 0,
        };
        let total = 0;

        history.forEach(item => {
            if (item.completed && item.skill?.category) {
                const categoryName = item.skill.category.charAt(0).toUpperCase() + item.skill.category.slice(1);
                counts[categoryName]++;
                total++;
            }
        });
        
        const data = Object.keys(counts).map(subject => ({
            subject,
            count: counts[subject],
        }));

        return { data, total };

    }, [history]);
    
    if (chartData.total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground font-semibold">Your skill balance chart is evolving!</p>
                <p className="text-sm text-muted-foreground mt-1">Complete some skills to see your profile grow.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.data}>
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
