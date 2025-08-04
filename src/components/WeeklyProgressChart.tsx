
"use client";

import * as React from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import type { SkillHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface WeeklyProgressChartProps {
    history: SkillHistoryItem[];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ history }) => {
    const [chartData, setChartData] = React.useState<Array<{ name: string; completed: number; }>>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
        const completedHistory = history.filter(item => item.completed);
        
        const data = last7Days.map(day => {
            const dayStr = format(day, 'E'); // e.g., 'Mon'
            const completedOnDay = completedHistory.some(item => {
                try {
                    return isSameDay(parseISO(item.date), day)
                } catch (e) {
                    return false;
                }
            });
            return {
                name: dayStr,
                completed: completedOnDay ? 1 : 0,
            };
        });
        setChartData(data);
        setIsLoading(false);
    }, [history]);
    
    if (isLoading) {
        return <Skeleton className="h-full w-full" />;
    }

    const totalCompleted = chartData.reduce((sum, day) => sum + day.completed, 0);

    if (totalCompleted === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">No progress this week.</p>
                <p className="text-sm text-muted-foreground mt-1">Complete a skill to see your progress!</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                    <linearGradient id="bar-fill-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={20} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1]} ticks={[0, 1]} tickFormatter={() => ''}/>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent) / 0.2)', radius: 'var(--radius)' }}
                    contentStyle={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background) / 0.8)',
                        backdropFilter: 'blur(4px)',
                        fontSize: '12px',
                        padding: '0.5rem'
                    }}
                    labelFormatter={(label) => `Day: ${label}`}
                    formatter={(value, name, props) => [props.payload.completed ? 'Completed' : 'Not Completed', 'Status']}
                />
                <Bar dataKey="completed" fill="url(#bar-fill-gradient)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default WeeklyProgressChart;
