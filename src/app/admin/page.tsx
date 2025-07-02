'use client';

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import MainLayout from '@/components/layout/MainLayout';

export default function AdminPage() {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
}
