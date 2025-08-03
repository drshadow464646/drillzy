
"use client";

import React, { useEffect, useState } from 'react';
import { useUserData } from '@/context/UserDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Target, BarChart, PieChart } from 'lucide-react';
import SkillRadarChart from '@/components/SkillRadarChart';
import SkillCategoryPieChart from '@/components/SkillCategoryPieChart';


export default function ProfilePage() {
    const { userData, isLoading } = useUserData();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (isLoading || !isClient || !userData) {
        return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen">
                <header className="py-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-48 mt-2" />
                </header>
                <main className="max-w-4xl mx-auto grid gap-8 mt-6">
                    <Skeleton className="h-24 w-full" />
                     <div className="grid md:grid-cols-2 gap-8 items-start">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </main>
            </div>
        );
    }
    
    const categoryCapitalized = userData.category ? userData.category.charAt(0).toUpperCase() + userData.category.slice(1) : 'Not Assigned';

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen">
            <header className="py-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Profile</h1>
                <p className="text-md sm:text-lg text-muted-foreground mt-1">
                    An overview of your learning journey and identity.
                </p>
            </header>

            <main className="max-w-4xl mx-auto grid gap-8 mt-6">
                 <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <User className="h-6 w-6 text-primary" />
                            <span>{userData.name}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 text-lg text-muted-foreground">
                            <Target className="h-5 w-5 text-accent" />
                            <span>You are a <strong className="text-accent-foreground">{categoryCapitalized}</strong></span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <Card className="shadow-lg rounded-xl">
                        <CardHeader className="flex-row items-center gap-4">
                            <BarChart className="h-6 w-6 text-primary flex-shrink-0" />
                            <CardTitle className="text-lg">Skill Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <SkillRadarChart data={userData.categoryCounts} />
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg rounded-xl">
                        <CardHeader className="flex-row items-center gap-4">
                            <PieChart className="h-6 w-6 text-primary flex-shrink-0" />
                            <CardTitle className="text-lg">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px] flex items-center justify-center">
                           <SkillCategoryPieChart data={userData.categoryCounts} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
