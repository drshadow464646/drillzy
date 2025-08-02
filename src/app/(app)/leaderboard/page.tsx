
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy, Sparkles, Sun, ChevronsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserData } from '@/context/UserDataProvider';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for the leaderboard.
const mockLeaderboardData = [
  // Inferno Tier (31+)
  { id: 1, name: 'Alex T.', streak: 42 },
  { id: 2, name: 'Brenda M.', streak: 38 },
  { id: 3, name: 'Charlie P.', streak: 35 },
  // Blaze Tier (11-30)
  { id: 4, name: 'Diana R.', streak: 29 },
  { id: 5, name: 'Ethan W.', streak: 25 },
  { id: 7, name: 'Grace L.', streak: 18 },
  { id: 8, name: 'Henry K.', streak: 15 },
  { id: 9, name: 'Ivy F.', streak: 11 },
  { id: 11, name: 'Kara S.', streak: 22 },
  { id: 12, name: 'Leo N.', streak: 19 },
  // Spark Tier (0-10)
  { id: 10, name: 'Jack B.', streak: 5 },
  { id: 13, name: 'Mia G.', streak: 8 },
  { id: 14, name: 'Noah V.', streak: 2 },
  { id: 15, name: 'Olivia H.', streak: 9 },
  { id: 16, name: 'Priya K.', streak: 1 },
];


const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" fill="currentColor" />;
  if (rank === 2) return <Trophy className="h-6 w-6 text-slate-300" fill="currentColor" />;
  if (rank === 3) return <Trophy className="h-6 w-6 text-orange-400" fill="currentColor" />;
  return <span className="text-lg font-bold w-6 text-center text-muted-foreground">{rank}</span>;
};

type User = { id: number; name: string; streak: number };
type Tier = 'spark' | 'blaze' | 'inferno';

const tiers: Record<Tier, { name: string, icon: React.ElementType }> = {
    inferno: { name: 'Inferno League', icon: ChevronsUp },
    blaze: { name: 'Blaze League', icon: Sun },
    spark: { name: 'Spark League', icon: Sparkles },
}

const LeaderboardList = ({ users, tierName, currentUserName }: { users: User[], tierName: string, currentUserName: string }) => {
    if (users.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No learners in the {tierName} yet. Keep up the great work!</div>
    }
    
    return (
        <ul className="divide-y divide-border">
          {users.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.name === currentUserName;
            
            return (
              <li
                key={user.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors",
                  isCurrentUser && "bg-primary/10",
                  rank === 1 && "bg-yellow-400/10",
                  rank === 2 && "bg-slate-300/10",
                  rank === 3 && "bg-orange-400/10",
                )}
              >
                <div className="w-8 flex justify-center">
                  <RankIcon rank={rank} />
                </div>
                <div className="flex-grow">
                  <p className={cn("font-bold text-lg text-foreground", isCurrentUser && "text-primary")}>{isCurrentUser ? `${user.name} (You)` : user.name}</p>
                </div>
                <div className={cn(
                    "flex items-center gap-2 font-bold text-xl",
                    rank === 1 && "text-yellow-400",
                    rank === 2 && "text-slate-300",
                    rank === 3 && "text-orange-400",
                    !([1,2,3].includes(rank)) && "text-accent"
                )}>
                  <span>{user.streak}</span>
                  <Flame className="h-6 w-6" />
                </div>
              </li>
            );
          })}
        </ul>
      );
}

export default function LeaderboardPage() {
  const { userData, isLoading } = useUserData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading || !isClient || !userData) {
    return (
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        <header className="py-4 text-center">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </header>
        <main className="max-w-2xl mx-auto mt-6 space-y-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="flex-row items-center gap-4 bg-card/80 p-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </main>
      </div>
    );
  }

  const currentUserData = {
    id: 99, // A unique ID for the current user
    name: userData.name,
    streak: userData.streakCount,
  };

  const allUsers = [...mockLeaderboardData, currentUserData].sort((a, b) => b.streak - a.streak);
  
  const sparkUsers = allUsers.filter(u => u.streak <= 10);
  const blazeUsers = allUsers.filter(u => u.streak > 10 && u.streak <= 30);
  const infernoUsers = allUsers.filter(u => u.streak > 30);

  const leagueOrder: {tier: Tier, users: User[]}[] = [
    { tier: 'inferno', users: infernoUsers },
    { tier: 'blaze', users: blazeUsers },
    { tier: 'spark', users: sparkUsers },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="py-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Leagues</h1>
        <p className="text-md text-muted-foreground mt-1">Compete in leagues based on your streak!</p>
      </header>

      <main className="max-w-2xl mx-auto mt-6 space-y-8">
        {leagueOrder.map(({ tier, users }) => {
            const { name, icon: Icon } = tiers[tier];
            return (
                <Card key={tier} className="shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="flex-row items-center gap-4 bg-card/80 p-4">
                        <Icon className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <LeaderboardList users={users} tierName={name} currentUserName={userData.name} />
                    </CardContent>
                </Card>
            )
        })}
      </main>
    </div>
  );
}
