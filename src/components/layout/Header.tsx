
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Users, Shield, Trophy } from 'lucide-react';
import { OsisCupLogo } from '@/components/icons/OsisCupLogo';

const navItems = [
  { href: '/', label: 'Beranda', icon: Trophy },
  { href: '/futsal/kontrol', label: 'Kontrol Futsal', icon: Shield },
  { href: '/voli/kontrol', label: 'Kontrol Voli', icon: Shield },
  { href: '/teams', label: 'Manajemen Tim', icon: Users },
];

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start">
        {children}
      </Button>
    </Link>
  );
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <OsisCupLogo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">SCOREBOARD</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
                 <Link key={item.label} href={item.href} passHref>
                    <span className={`transition-colors hover:text-foreground/80 ${usePathname() !== item.href && 'text-foreground/60'}`}>
                        {item.label}
                    </span>
                </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                    <Link href="/" className="mr-6 flex items-center space-x-2 p-4">
                        <OsisCupLogo className="h-6 w-6" />
                        <span className="font-bold">SCOREBOARD</span>
                    </Link>
                  <nav className="grid gap-2 p-4">
                    {navItems.map((item) => (
                      <NavLink key={item.label} href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
             <Link href="/" className="flex items-center space-x-2 md:hidden">
                <OsisCupLogo className="h-6 w-6" />
                <span className="font-bold">SCOREBOARD</span>
            </Link>
        </div>
      </div>
    </header>
  );
}
