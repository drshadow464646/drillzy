
"use client";

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfDay } from 'date-fns';
import type { SkillHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface CumulativeSkillsChartProps {
    history: SkillHistoryItem[];
}

const CumulativeSkillsChart: React.FC<CumulativeSkillsChartProps> = ({ history }) => {
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const completedHistory = history
            .filter(item => item.completed && item.skillId !== "NO_SKILLS_LEFT")
            .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

        if (completedHistory.length === 0) {
            setIsLoading(false);
            setChartData([]);
            return;
        }

        const firstDay = startOfDay(parseISO(completedHistory[0].date));
        const lastDay = startOfDay(new Date());
        
        if (firstDay > lastDay) {
             const data = [{
                date: format(firstDay, 'MMM d'),
                Skills: completedHistory.length
            }];
            setChartData(data);
            setIsLoading(false);
            return;
        }

        const interval = eachDayOfInterval({ start: firstDay, end: lastDay });

        let cumulativeCount = 0;
        const dateMap = new Map<string, number>();
        completedHistory.forEach(item => {
            const dateStr = format(parseISO(item.date), 'yyyy-MM-dd');
            dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        });
        
        let lastKnownCount = 0;
        const data = interval.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            if (dateMap.has(dateStr)) {
                cumulativeCount += dateMap.get(dateStr)!;
            }
            lastKnownCount = cumulativeCount;
            return {
                date: format(day, 'MMM d'),
                Skills: lastKnownCount,
            };
        });

        setChartData(data);
        setIsLoading(false);

    }, [history]);

    if (isLoading) {
        return <Skeleton className="w-full h-full" />;
    }

    if (chartData.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">Not enough data yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Complete skills over a few days to see your growth!</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="area-fill-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background) / 0.8)',
                        backdropFilter: 'blur(4px)',
                    }}
                />
                <Area type="monotone" dataKey="Skills" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#area-fill-gradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CumulativeSkillsChart;
