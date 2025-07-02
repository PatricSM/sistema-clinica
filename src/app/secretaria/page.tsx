'use client';

import { SecretariaDashboard } from '@/components/secretaria/SecretariaDashboard';
import MainLayout from '@/components/layout/MainLayout';

export default function SecretariaPage() {
  return (
    <MainLayout>
      <SecretariaDashboard />
    </MainLayout>
  );
}
