
'use client';
import AdminAuthGuard from '@/components/admin-auth-guard';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The announcement page is now handled by the auth guard inside its own file.
  if (pathname === '/admin/announcement') {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="bg-background min-h-[calc(100vh-10rem)]">{children}</div>
    </AdminAuthGuard>
  );
}
