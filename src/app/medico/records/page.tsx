'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { ProntuarioEletronico } from '@/components/medico/ProntuarioEletronico'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function RecordsPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Prontuários Médicos</h1>
          <p className="text-gray-600">Gerencie e visualize os prontuários dos seus pacientes</p>
        </div>
        
        <ProntuarioEletronico />
      </div>
    </MainLayout>
  )
}
