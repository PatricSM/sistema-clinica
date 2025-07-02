'use client';

import { MedicoDashboard } from '@/components/medico/MedicoDashboard';
import MainLayout from '@/components/layout/MainLayout';

export default function MedicoPage() {
  return (
    <MainLayout>
      <MedicoDashboard />
    </MainLayout>
  );
}
