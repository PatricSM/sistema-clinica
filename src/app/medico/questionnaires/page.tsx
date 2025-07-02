'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'
import { 
  DocumentCheckIcon, 
  UserIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

interface QuestionnaireResponse {
  id: number
  patient_id: number
  patient_name: string
  questionnaire_type: string
  total_score: number
  interpretation: string
  created_at: string
  responses: any
}

export default function QuestionnairesPage() {
  const { user } = useCustomAuth()
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchPatients()
      fetchResponses()
    }
  }, [user, selectedType, selectedPatient])

  const fetchPatients = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patients!inner(
            id,
            user:users!inner(full_name)
          )
        `)
        .eq('professional_id', user?.id)

      if (error) throw error

      // Remover duplicados
      const uniquePatients = new Map()
      appointmentsData?.forEach((appointment: any) => {
        const patientId = appointment.patient.id
        if (!uniquePatients.has(patientId)) {
          uniquePatients.set(patientId, {
            id: patientId,
            name: appointment.patient.user.full_name
          })
        }
      })

      setPatients(Array.from(uniquePatients.values()))
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    }
  }

  const fetchResponses = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('patient_questionnaires')
        .select(`
          *,
          patient:patients!inner(
            user:users!inner(full_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (selectedType !== 'all') {
        query = query.eq('questionnaire_type', selectedType)
      }

      if (selectedPatient) {
        query = query.eq('patient_id', selectedPatient)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedResponses = data?.map(response => ({
        id: response.id,
        patient_id: response.patient_id,
        patient_name: response.patient.user.full_name,
        questionnaire_type: response.questionnaire_type,
        total_score: response.total_score,
        interpretation: response.interpretation,
        created_at: response.created_at,
        responses: response.responses
      })) || []

      setResponses(formattedResponses)
    } catch (error) {
      console.error('Erro ao buscar respostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuestionnaireTypeName = (type: string) => {
    const types = {
      'phq9': 'PHQ-9 (Depressão)',
      'gad7': 'GAD-7 (Ansiedade)',
      'beck': 'Inventário de Beck',
      'stress': 'Escala de Estresse'
    }
    return types[type as keyof typeof types] || type
  }

  const getInterpretationColor = (interpretation: string) => {
    if (!interpretation) {
      return 'bg-gray-100 text-gray-800'
    }
    if (interpretation.includes('Mínima') || interpretation.includes('Normal')) {
      return 'bg-green-100 text-green-800'
    }
    if (interpretation.includes('Leve')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (interpretation.includes('Moderada')) {
      return 'bg-orange-100 text-orange-800'
    }
    if (interpretation.includes('Grave') || interpretation.includes('Severa')) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const groupedStats = responses.reduce((acc, response) => {
    const type = response.questionnaire_type
    if (!acc[type]) {
      acc[type] = { count: 0, avgScore: 0, totalScore: 0 }
    }
    acc[type].count += 1
    acc[type].totalScore += response.total_score
    acc[type].avgScore = acc[type].totalScore / acc[type].count
    return acc
  }, {} as Record<string, { count: number; avgScore: number; totalScore: number }>)

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

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Questionários e Escalas</h1>
          <p className="text-gray-600">Acompanhe as respostas dos questionários dos seus pacientes</p>
        </div>

        {/* Estatísticas por Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(groupedStats).map(([type, stats]) => (
            <div key={type} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {getQuestionnaireTypeName(type)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
                  <p className="text-xs text-gray-500">
                    Média: {stats.avgScore.toFixed(1)}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Questionário
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="phq9">PHQ-9 (Depressão)</option>
                <option value="gad7">GAD-7 (Ansiedade)</option>
                <option value="beck">Inventário de Beck</option>
                <option value="stress">Escala de Estresse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <select
                value={selectedPatient || ''}
                onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os pacientes</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Respostas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Respostas dos Questionários ({responses.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {responses.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma resposta encontrada</p>
              </div>
            ) : (
              responses.map((response) => (
                <div key={response.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">
                          {response.patient_name}
                        </h4>
                        <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getQuestionnaireTypeName(response.questionnaire_type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(response.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          Pontuação: {response.total_score}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInterpretationColor(response.interpretation)}`}>
                          {response.interpretation}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Implementar visualização detalhada
                          alert('Funcionalidade de visualização detalhada será implementada')
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>

                  {/* Prévia das respostas */}
                  {response.responses && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Últimas respostas:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {Object.entries(response.responses as any).slice(0, 4).map(([key, value]) => (
                          <span key={key} className="text-gray-500">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
