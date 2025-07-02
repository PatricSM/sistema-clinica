'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import TasksManager from '@/components/medico/TasksManager'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function TasksPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Tarefas</h1>
          <p className="text-gray-600">Crie e acompanhe tarefas para seus pacientes</p>
        </div>
        
        <TasksManager professionalId={user?.id || 0} />
      </div>
    </MainLayout>
  )
}
