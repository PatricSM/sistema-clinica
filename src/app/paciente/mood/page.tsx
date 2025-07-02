'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { MoodDiary } from '@/components/paciente/MoodDiary'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function MoodPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Diário de Humor</h1>
          <p className="text-gray-600">Registre e acompanhe seu humor diário</p>
        </div>
        
        <MoodDiary />
      </div>
    </MainLayout>
  )
}
