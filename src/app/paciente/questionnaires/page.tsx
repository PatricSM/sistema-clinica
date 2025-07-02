'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'
import { 
  DocumentCheckIcon, 
  ClockIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface QuestionnaireTemplate {
  id: number
  name: string
  description: string
  type: string
}

export default function QuestionnairesPage() {
  const { user } = useCustomAuth()
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([])
  const [patientId, setPatientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPatientId()
    }
  }, [user])

  useEffect(() => {
    if (patientId) {
      fetchTemplates()
    }
  }, [patientId])

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
    }
  }

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      
      // Buscar templates de questionários do banco
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select('id, name, description')
        .order('name')

      if (error) throw error

      // Transformar dados para incluir type baseado no nome
      const templateData: QuestionnaireTemplate[] = data?.map(template => {
        let type = 'general'
        const name = template.name.toLowerCase()
        
        if (name.includes('phq') || name.includes('beck') || name.includes('depres')) {
          type = 'depression'
        } else if (name.includes('gad') || name.includes('ansiedade') || name.includes('anxiety')) {
          type = 'anxiety'
        } else if (name.includes('stress') || name.includes('estresse')) {
          type = 'stress'
        }

        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          type
        }
      }) || []

      setTemplates(templateData)
    } catch (error) {
      console.error('Erro ao buscar questionários:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'depression': return 'bg-red-100 text-red-800'
      case 'anxiety': return 'bg-yellow-100 text-yellow-800'
      case 'stress': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const handleStartQuestionnaire = (templateId: number) => {
    // Por enquanto, mostrar um alerta
    alert(`Questionário ${templateId} será implementado em breve`)
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

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Questionários e Escalas</h1>
          <p className="text-gray-600">Responda aos questionários solicitados pelo seu psicólogo</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de Questionários */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Questionários Disponíveis
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {templates.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum questionário disponível no momento</p>
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {template.name}
                        </h4>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                          {template.type === 'depression' ? 'Depressão' :
                           template.type === 'anxiety' ? 'Ansiedade' :
                           template.type === 'stress' ? 'Estresse' : 
                           template.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartQuestionnaire(template.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
