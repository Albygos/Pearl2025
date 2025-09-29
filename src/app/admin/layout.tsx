
'use client';
import AdminAuthGuard from '@/components/admin-auth-guard';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The announcement page uses a different layout, but still needs the auth guard.
  if (pathname === '/admin/announcement') {
    return <AdminAuthGuard>{children}</AdminAuthGuard>;
  }

  return (
    <AdminAuthGuard>
      <div className="bg-background min-h-[calc(100vh-10rem)]">{children}</div>
    </AdminAuthGuard>
  );
}
