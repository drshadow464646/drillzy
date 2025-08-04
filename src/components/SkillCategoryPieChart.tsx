
"use client";

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { SkillHistoryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface SkillCategoryPieChartProps {
    history: SkillHistoryItem[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const SkillCategoryPieChart: React.FC<SkillCategoryPieChartProps> = ({ history }) => {
    const [categoryData, setCategoryData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function processHistory() {
            // This component is now harder to implement because skill category is not stored directly.
            // For now, we will just show a placeholder. A more complex implementation would
            // require fetching skill details or storing category in history.
            // Let's assume a dummy distribution for now.
             const counts = {
                thinker: 0,
                builder: 0,
                creator: 0,
                connector: 0,
            };

            const completedSkillItems = history
              .filter(item => item.completed && item.skill_id !== 'NO_SKILLS_LEFT' && item.skill_id !== 'GENERATING');

            // Since we don't have categories, we can't build this chart accurately.
            // We'll leave it blank for now. A future implementation could store
            // the category of the generated skill in the history table.
            
            setCategoryData([]);
            setIsLoading(false);
        }

        processHistory();
    }, [history]);
    
    if (isLoading) {
        return <Skeleton className="w-full h-full" />;
    }
    
    if (categoryData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">Category data not available.</p>
                <p className="text-sm text-muted-foreground mt-1">Skill categories will be analyzed in a future update!</p>
            </div>
        )
    }
    
    const COLORS = [
        'hsl(var(--chart-1))', 
        'hsl(var(--chart-2))', 
        'hsl(var(--chart-3))', 
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
    ];
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background) / 0.8)',
                        backdropFilter: 'blur(4px)',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend
                    iconSize={10}
                    wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default SkillCategoryPieChart;
