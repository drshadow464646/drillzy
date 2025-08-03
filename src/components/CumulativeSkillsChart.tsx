
"use client";

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { CumulativeGrowthItem } from '@/lib/types';

interface CumulativeSkillsChartProps {
    data: CumulativeGrowthItem[];
}

const CumulativeSkillsChart: React.FC<CumulativeSkillsChartProps> = ({ data }) => {

    const chartData = React.useMemo(() => {
        if (!data) return [];
        return data.map(item => ({
            date: format(parseISO(item.date), 'MMM d'),
            Skills: item.total,
        }));
    }, [data]);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">Loading data...</p>
            </div>
        )
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
