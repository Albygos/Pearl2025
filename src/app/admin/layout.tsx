import AdminAuthGuard from '@/components/admin-auth-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="bg-background min-h-[calc(100vh-10rem)]">{children}</div>
    </AdminAuthGuard>
  );
}
