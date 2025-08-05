
"use client";

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { SkillHistoryItem, Skill } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { createClient } from '@/lib/supabase/client';

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
    const [isLoading, setIsLoading] = React.useState(true);
    const supabase = React.useMemo(() => createClient(), []);

    const categoryData = React.useMemo(() => {
        let isMounted = true;

        async function processHistory() {
            const counts = {
                thinker: 0,
                builder: 0,
                creator: 0,
                connector: 0,
            };

            const completedSkillItems = history
              .filter(item => item.completed && item.skill_id !== 'NO_SKILLS_LEFT' && item.skill_id !== 'GENERATING');

            const skillIds = completedSkillItems.map(item => item.skill_id).filter(id => id);

            if (skillIds.length > 0) {
                 const { data: skills, error } = await supabase
                    .from('skills')
                    .select('category')
                    .in('id', skillIds);
                
                if (isMounted) {
                    if (error) {
                        console.error("Error fetching skills for pie chart:", error);
                    } else if (skills) {
                        skills.forEach(skill => {
                            if (skill.category) {
                                counts[skill.category as keyof typeof counts]++;
                            }
                        });
                    }
                }
            }
            
            const data = Object.entries(counts)
                .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
                .filter(item => item.value > 0);
            
            if(isMounted) {
                setIsLoading(false);
            }
            return data;
        }

        // We don't need to return the result of processHistory, we just need to set the state
        // and the memo will re-evaluate when `history` changes.
        // For the purpose of memoization, we're making it self-contained.
        const promise = processHistory();

        return () => {
          isMounted = false;
        };
    }, [history, supabase]);

    const [memoizedData, setMemoizedData] = React.useState<any[]>([]);

    React.useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            const counts = {
                thinker: 0,
                builder: 0,
                creator: 0,
                connector: 0,
            };
             const completedSkillItems = history
              .filter(item => item.completed && item.skill_id !== 'NO_SKILLS_LEFT' && item.skill_id !== 'GENERATING');

            const skillIds = completedSkillItems.map(item => item.skill_id).filter(Boolean);


            if (skillIds.length > 0) {
                const { data: skills, error } = await supabase
                    .from('skills')
                    .select('category')
                    .in('id', skillIds);

                if (error) {
                    console.error("Error fetching skills for pie chart:", error);
                } else if (skills) {
                    skills.forEach(skill => {
                        if (skill.category) {
                            counts[skill.category as keyof typeof counts]++;
                        }
                    });
                }
            }

            const data = Object.entries(counts)
                .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
                .filter(item => item.value > 0);

            if (isMounted) {
                setMemoizedData(data);
                setIsLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [history, supabase]);
    
    if (isLoading) {
        return <Skeleton className="w-full h-full" />;
    }
    
    if (memoizedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground font-semibold">No category data yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Complete some skills to see your breakdown!</p>
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
                    data={memoizedData}
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
                    {memoizedData.map((entry, index) => (
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
