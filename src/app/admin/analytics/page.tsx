'use client';

import MainLayout from '@/components/layout/MainLayout';
import AnalyticsAdvanced from '@/components/admin/AnalyticsAdvanced';

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <AnalyticsAdvanced />
      </div>
    </MainLayout>
  );
}
