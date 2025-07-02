'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { MedicationManager } from '@/components/paciente/MedicationManager'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function MedicationsPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Medicamentos</h1>
          <p className="text-gray-600">Gerencie seus medicamentos e acompanhe a rotina de medicação</p>
        </div>
        
        <MedicationManager />
      </div>
    </MainLayout>
  )
}
