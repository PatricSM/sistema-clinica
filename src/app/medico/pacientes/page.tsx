'use client';

import { PacientesMedico } from '@/components/medico/PacientesMedico';
import MainLayout from '@/components/layout/MainLayout';

export default function PacientesPage() {
  return (
    <MainLayout>
      <PacientesMedico />
    </MainLayout>
  );
}
