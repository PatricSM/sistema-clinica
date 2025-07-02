'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ClipboardList,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Send
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface QuestionnaireTemplate {
  id: number
  name: string
  description: string
  questions_json: any
}

interface Question {
  id: string
  text: string
  type: 'likert' | 'multiple_choice'
  options: Array<{
    value: number
    label: string
  }>
}

interface QuestionnaireFormProps {
  templateId: number
  patientId: number
  onComplete: () => void
  onBack: () => void
}

export function QuestionnaireForm({ templateId, patientId, onComplete, onBack }: QuestionnaireFormProps) {
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    setIsLoading(true)
    try {
      const { data: templateData, error } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error || !templateData) {
        console.error('Erro ao carregar questionário:', error)
        return
      }

      setTemplate(templateData)
    } catch (error) {
      console.error('Erro ao carregar questionário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const getProgress = () => {
    if (!template?.questions_json?.questions) return 0
    const totalQuestions = template.questions_json.questions.length
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / totalQuestions) * 100
  }

  const isAllAnswered = () => {
    if (!template?.questions_json?.questions) return false
    const totalQuestions = template.questions_json.questions.length
    const answeredQuestions = Object.keys(answers).length
    return answeredQuestions === totalQuestions
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getScoreInterpretation = (score: number) => {
    if (!template?.questions_json?.scoring?.interpretation) return 'Resultado calculado'
    
    const interpretations = template.questions_json.scoring.interpretation
    
    for (const [range, interpretation] of Object.entries(interpretations)) {
      const [min, max] = range.split('-').map(n => parseInt(n))
      if (score >= min && score <= max) {
        return interpretation as string
      }
    }
    
    return 'Resultado calculado'
  }

  const submitAnswers = async () => {
    if (!isAllAnswered()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('patient_questionnaires')
        .insert({
          patient_id: patientId,
          questionnaire_template_id: templateId,
          answers_json: answers,
          completion_date: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao salvar respostas:', error)
        alert('Erro ao salvar respostas. Tente novamente.')
        return
      }

      setIsComplete(true)
    } catch (error) {
      console.error('Erro ao salvar respostas:', error)
      alert('Erro ao salvar respostas. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Questionário não encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Não foi possível carregar o questionário solicitado.
          </p>
          <Button onClick={onBack}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    const score = calculateScore()
    const interpretation = getScoreInterpretation(score)

    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Questionário Concluído!
            </h2>
            <p className="text-green-700 mb-6">
              Suas respostas foram salvas com sucesso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Sua Pontuação</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {score}/{template.questions_json.scoring.max}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Interpretação</h3>
                <p className="text-lg font-medium text-gray-700">
                  {interpretation}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Seu médico poderá visualizar estas respostas em sua próxima consulta.
            </p>

            <Button onClick={onComplete} className="w-full md:w-auto">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const questions = template.questions_json.questions as Question[]
  const progress = getProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-gray-600">{template.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">
        Progresso: {Object.keys(answers).length} de {questions.length} perguntas respondidas
      </p>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id} className={`transition-all duration-200 ${
            answers[question.id] !== undefined ? 'border-green-200 bg-green-50' : ''
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold mr-3 px-2.5 py-0.5 rounded-full">
                  {index + 1}
                </span>
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      answers[question.id] === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleAnswer(question.id, option.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[question.id] === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[question.id] === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium">{option.label}</span>
                      <span className="ml-2 text-sm text-gray-500">({option.value} pt{option.value !== 1 ? 's' : ''})</span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={submitAnswers}
          disabled={!isAllAnswered() || isSubmitting}
          size="lg"
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Respostas
            </>
          )}
        </Button>
      </div>

      {!isAllAnswered() && (
        <div className="text-center">
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            ⚠️ Por favor, responda todas as perguntas antes de enviar.
          </p>
        </div>
      )}
    </div>
  )
}
