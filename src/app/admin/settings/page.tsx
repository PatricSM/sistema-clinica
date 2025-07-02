'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { SettingsAdmin } from '@/components/admin/SettingsAdmin'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function SettingsPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        
        <SettingsAdmin />
      </div>
    </MainLayout>
  )
}
