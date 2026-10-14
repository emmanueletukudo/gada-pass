'use client';

import { RoleGuard } from '@/components/dashboard/guards/roleguard';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['GATE_AGENT']}>
      <main >{children}</main>
    </RoleGuard>
  );
}
