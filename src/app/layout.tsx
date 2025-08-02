import type { Metadata } from 'next';
import './globals.css';
import { UserDataProvider } from '@/context/UserDataProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from "@/components/ui/toaster"
import CapacitorAuthHandler from '@/components/CapacitorAuthHandler';

export const metadata: Metadata = {
  title: 'Drillzy',
  description: 'Learn a new skill every day.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Lora:wght@400;600;700&family=Roboto+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <UserDataProvider>
                <CapacitorAuthHandler>
                  {children}
                </CapacitorAuthHandler>
                <Toaster />
            </UserDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
