
"use client";

import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { SkillHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface SkillRadarChartProps {
    history: SkillHistoryItem[];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ history }) => {
    const [chartData, setChartData] = React.useState<any>(null);
     const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const processHistory = async () => {
             // This component is now harder to implement because skill category is not stored directly.
            // For now, we will just show a placeholder.
            setChartData({
                data: [],
                total: 0
            });
            setIsLoading(false);
        }
        processHistory();
    }, [history]);
    
    if (isLoading || !chartData) {
        return <Skeleton className="w-full h-64" />;
    }

    if (chartData.total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground font-semibold">Your skill balance chart is evolving!</p>
                <p className="text-sm text-muted-foreground mt-1">Complete AI-generated skills to see your new profile grow.</p>
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
