'use client';

import MainLayout from '@/components/layout/MainLayout';
import FinancialDashboard from '@/components/admin/FinancialDashboard';

export default function AdminFinancialPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <FinancialDashboard />
      </div>
    </MainLayout>
  );
}
