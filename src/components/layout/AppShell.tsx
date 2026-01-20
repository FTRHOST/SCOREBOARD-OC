'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define paths where the header should be hidden (the overlay/scoreboard views)
  const isOverlay = pathname.startsWith('/futsal') || pathname.startsWith('/voli');

  return (
    <>
      {!isOverlay && <Header />}
      <main className={!isOverlay ? "container mx-auto p-4" : ""}>
        {children}
      </main>
    </>
  );
}
