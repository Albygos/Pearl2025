'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Shield,
  Users,
  Star,
  BarChart,
  Home,
  ImageIcon,
  ChevronDown,
  LogOut,
  CalendarPlus,
  GalleryHorizontal,
  LayoutDashboard,
  Building,
  Megaphone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const MainNav = ({ isUnitLoggedIn, pathname }: { isUnitLoggedIn: boolean, pathname: string }) => {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/venue', label: 'Venue' },
    { href: isUnitLoggedIn ? '/dashboard' : '/login', label: 'My Dashboard' },
  ];

  return (
    <>
      {navLinks.map((link) => (
        <Button key={link.label} variant="ghost" asChild className={cn(pathname === link.href && 'font-bold')}>
          <Link
            href={link.href}
            className={cn(
              'text-sm transition-colors',
              pathname === link.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {link.label}
          </Link>
        </Button>
      ))}
    </>
  );
};

const MobileMainNav = ({ isUnitLoggedIn, pathname }: { isUnitLoggedIn: boolean, pathname: string }) => {
   const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/gallery', label: 'Gallery', icon: GalleryHorizontal },
    { href: '/venue', label: 'Venue', icon: Building },
    { href: isUnitLoggedIn ? '/dashboard' : '/login', label: 'My Dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
       {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              'text-lg font-medium flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent',
              pathname === link.href ? 'bg-accent text-primary' : ''
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
    </>
  );
}


const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/events', label: 'Manage Events', icon: CalendarPlus },
  { href: '/admin/units', label: 'Manage Meghalas', icon: Users },
  { href: '/admin/scores', label: 'Manage Scores', icon: Star },
  { href: '/admin/gallery', label: 'Manage Gallery', icon: ImageIcon },
  { href: '/admin/performance', label: 'Performance', icon: BarChart },
  { href: '/admin/venue', label: 'Manage Venue', icon: Building },
  { href: '/admin/announcement', label: 'Announcements', icon: Megaphone },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname.startsWith('/admin');
  const [isUnitLoggedIn, setIsUnitLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsUnitLoggedIn(!!localStorage.getItem('artfestlive_unit_id'));
    }
     const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
    });
    
    const handleStorageChange = () => {
       setIsUnitLoggedIn(!!localStorage.getItem('artfestlive_unit_id'));
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [pathname]);

  const handleUnitSignOut = () => {
    localStorage.removeItem('artfestlive_unit_id');
    setIsUnitLoggedIn(false);
    router.push('/login');
  };

  const handleAdminSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };


  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          <MainNav isUnitLoggedIn={isUnitLoggedIn} pathname={pathname} />
        </nav>

        <div className="flex items-center gap-2">
          {isAdminPage ? (
             isAdminLoggedIn && !pathname.startsWith('/admin/announcement') && (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    Admin Menu
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminNavLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                   <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Back to Site</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAdminSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {isUnitLoggedIn ? (
                <Button variant="outline" size="sm" onClick={handleUnitSignOut}>
                  <LogOut className="mr-2" />
                  Sign Out
                </Button>
              ) : (
                 pathname !== '/login' && !pathname.startsWith('/admin') && (
                  <>
                    <Button asChild>
                      <Link href="/login">Meghala Sign In</Link>
                    </Button>
                     <Button variant="outline" asChild>
                      <Link href="/admin/login">Admin Sign In</Link>
                    </Button>
                  </>
                )
              )}
            </div>
          )}
          
          <div className="md:hidden">
           {!isAdminPage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 pt-8">
                  <nav className="flex flex-col gap-4">
                    <MobileMainNav isUnitLoggedIn={isUnitLoggedIn} pathname={pathname} />
                  </nav>
                   <div className="border-t pt-4">
                    {isUnitLoggedIn ? (
                        <Button variant="outline" className="w-full" onClick={handleUnitSignOut}>
                          <LogOut className="mr-2" />
                          Sign Out
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button asChild className="w-full">
                            <Link href="/login">Meghala Sign In</Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/admin/login">Admin Sign In</Link>
                          </Button>
                        </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
           )}
          </div>
        </div>
      </div>
    </header>
  );
}
