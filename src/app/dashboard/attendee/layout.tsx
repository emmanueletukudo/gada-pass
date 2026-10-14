'use client';

import { RoleGuard } from '@/components/dashboard/guards/roleguard';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['ATTENDEE']}>
      <main >{children}</main>
    </RoleGuard>
  );
}
