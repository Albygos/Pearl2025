'use client';

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        // If they are on the login page, redirect them to the admin dashboard.
        if (pathname === '/admin/login') {
          router.replace('/admin');
        } else {
          setLoading(false);
        }
      } else {
        // User is signed out.
        // If they are not on the login page, redirect them there.
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        } else {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
