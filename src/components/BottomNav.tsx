
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Flame, Settings, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Brain, label: 'Home' },
  { href: '/streak', icon: Flame, label: 'Streak' },
  { href: '/leaderboard', icon: Trophy, label: 'Leagues' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 shadow-t-lg z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-16 gap-1 text-muted-foreground transition-colors hover:text-primary">
              <item.icon className={cn("h-7 w-7", isActive && "text-primary")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-xs font-medium", isActive && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
