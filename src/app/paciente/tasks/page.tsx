'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PatientTasks from '@/components/paciente/PatientTasks'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'

export default function TasksPage() {
  const { user } = useCustomAuth()
  const [patientId, setPatientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPatientId()
    }
  }, [user])

  const fetchPatientId = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setPatientId(data.id)
    } catch (error) {
      console.error('Erro ao buscar patient_id:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!patientId) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
            <p className="text-gray-600">Não foi possível carregar os dados do paciente</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
          <p className="text-gray-600">Acompanhe suas tarefas e mensagens dos profissionais</p>
        </div>
        
        <PatientTasks patientId={patientId} />
      </div>
    </MainLayout>
  )
}
