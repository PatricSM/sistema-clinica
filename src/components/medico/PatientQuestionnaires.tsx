'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ClipboardList,
  Calendar,
  BarChart3,
  Eye,
  PlusCircle,
  Target
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface QuestionnaireTemplate {
  id: number
  name: string
  description: string
  questions_json: any
}

interface PatientQuestionnaire {
  id: number
  patient_id: number
  questionnaire_template_id: number
  completion_date: string
  answers_json: any
  template: QuestionnaireTemplate
}

interface PatientQuestionnairesProps {
  patientId: string
}

export function PatientQuestionnaires({ patientId }: PatientQuestionnairesProps) {
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<PatientQuestionnaire[]>([])
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<PatientQuestionnaire | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list')

  const supabase = createClient()

  useEffect(() => {
    if (patientId) {
      loadPatientQuestionnaires()
    }
  }, [patientId])

  const loadPatientQuestionnaires = async () => {
    setIsLoading(true)
    try {
      // Buscar o patient_id real
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('id', parseInt(patientId))
        .single()

      if (patientError || !patientData) {
        console.error('Erro ao encontrar paciente:', patientError)
        setCompletedQuestionnaires([])
        setIsLoading(false)
        return
      }

      const { data: questionnaires, error } = await supabase
        .from('patient_questionnaires')
        .select(`
          *,
          template:questionnaire_templates!inner(*)
        `)
        .eq('patient_id', patientData.id)
        .order('completion_date', { ascending: false })

      if (error) {
        console.error('Erro ao carregar questionários:', error)
        return
      }

      setCompletedQuestionnaires(questionnaires || [])
    } catch (error) {
      console.error('Erro ao carregar questionários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateScore = (answers: any, template: QuestionnaireTemplate) => {
    if (!answers || !template.questions_json?.questions) return 0
    
    const questions = template.questions_json.questions
    let totalScore = 0

    questions.forEach((question: any) => {
      const answer = answers[question.id]
      if (typeof answer === 'number') {
        totalScore += answer
      }
    })

    return totalScore
  }

  const getScoreInterpretation = (score: number, template: QuestionnaireTemplate) => {
    if (!template.questions_json?.scoring?.interpretation) return 'Não disponível'
    
    const interpretations = template.questions_json.scoring.interpretation
    
    for (const [range, interpretation] of Object.entries(interpretations)) {
      const [min, max] = range.split('-').map(n => parseInt(n))
      if (score >= min && score <= max) {
        return interpretation as string
      }
    }
    
    return 'Fora do padrão'
  }

  const getScoreColor = (score: number, template: QuestionnaireTemplate) => {
    const maxScore = template.questions_json?.scoring?.max || 100
    const percentage = (score / maxScore) * 100
    
    if (percentage <= 25) return 'text-green-600 bg-green-50'
    if (percentage <= 50) return 'text-yellow-600 bg-yellow-50'
    if (percentage <= 75) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (activeView === 'detail' && selectedQuestionnaire) {
    const score = calculateScore(selectedQuestionnaire.answers_json, selectedQuestionnaire.template)
    const interpretation = getScoreInterpretation(score, selectedQuestionnaire.template)
    const scoreColor = getScoreColor(score, selectedQuestionnaire.template)

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setActiveView('list')}>
          ← Voltar à Lista
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />
              {selectedQuestionnaire.template.name}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Preenchido em: {formatDate(selectedQuestionnaire.completion_date)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Pontuação</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {score}/{selectedQuestionnaire.template.questions_json.scoring.max}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${scoreColor.includes('green') ? 'border-green-200' : 
                               scoreColor.includes('yellow') ? 'border-yellow-200' :
                               scoreColor.includes('orange') ? 'border-orange-200' : 'border-red-200'}`}>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Interpretação</span>
                    </div>
                    <div className={`text-lg font-semibold ${scoreColor.split(' ')[0]}`}>
                      {interpretation}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Respostas Detalhadas</h3>
                <div className="space-y-4">
                  {selectedQuestionnaire.template.questions_json.questions.map((question: any, index: number) => {
                    const answer = selectedQuestionnaire.answers_json[question.id]
                    const selectedOption = question.options.find((opt: any) => opt.value === answer)
                    
                    return (
                      <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.text}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            Pontos: {answer}
                          </span>
                          <span className="text-gray-700">
                            {selectedOption?.label || 'Resposta não encontrada'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Questionários e Escalas</h2>
          <p className="text-gray-600 text-sm">
            {completedQuestionnaires.length} questionário{completedQuestionnaires.length !== 1 ? 's' : ''} preenchido{completedQuestionnaires.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {completedQuestionnaires.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum questionário preenchido
            </h3>
            <p className="text-gray-500 mb-4">
              Este paciente ainda não preencheu nenhum questionário ou escala.
            </p>
            <p className="text-sm text-gray-400">
              🚀 Em breve: Funcionalidade para atribuir questionários ao paciente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {completedQuestionnaires.map((questionnaire) => {
            const score = calculateScore(questionnaire.answers_json, questionnaire.template)
            const interpretation = getScoreInterpretation(score, questionnaire.template)
            const scoreColor = getScoreColor(score, questionnaire.template)

            return (
              <Card key={questionnaire.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-2">
                        <ClipboardList className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">{questionnaire.template.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${scoreColor}`}>
                          {score}/{questionnaire.template.questions_json.scoring.max} pts
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {questionnaire.template.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(questionnaire.completion_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{interpretation}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestionnaire(questionnaire)
                        setActiveView('detail')
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
