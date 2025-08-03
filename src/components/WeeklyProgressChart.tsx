
"use client";

import * as React from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { WeeklyProgressItem } from '@/lib/types';

interface WeeklyProgressChartProps {
    data: WeeklyProgressItem[];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ data }) => {
    
    const chartData = React.useMemo(() => {
        if (!data) return [];
        return data.map(item => ({
            name: format(parseISO(item.date), 'E'), // e.g., 'Mon'
            completed: item.completed > 0 ? 1 : 0, // Ensure it's 0 or 1 for the chart's Y-axis domain
        }));
    }, [data]);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">Loading data...</p>
            </div>
        )
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
