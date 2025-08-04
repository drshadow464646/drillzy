
import { BottomNav } from '@/components/BottomNav';
import { UserDataProvider } from '@/context/UserDataProvider';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <UserDataProvider>
            <main className="pb-24">
                {children}
            </main>
            <BottomNav />
        </UserDataProvider>
    );
}
