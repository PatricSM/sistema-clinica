'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  AlertTriangle,
  Info,
  FileText
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { DiarioHumor } from '@/types'

interface PatientMoodEntry {
  date: string
  mood: number
  notes: string
  color: string
  emoji: string
  label: string
}

const moodLevels = [
  { value: 1, label: 'Muito Ruim', color: 'bg-red-600', emoji: '😢', textColor: 'text-red-600', alertLevel: 'high' },
  { value: 2, label: 'Ruim', color: 'bg-red-400', emoji: '😞', textColor: 'text-red-400', alertLevel: 'high' },
  { value: 3, label: 'Baixo', color: 'bg-orange-400', emoji: '😕', textColor: 'text-orange-400', alertLevel: 'medium' },
  { value: 4, label: 'Regular', color: 'bg-yellow-400', emoji: '😐', textColor: 'text-yellow-600', alertLevel: 'medium' },
  { value: 5, label: 'Neutro', color: 'bg-gray-400', emoji: '😶', textColor: 'text-gray-600', alertLevel: 'low' },
  { value: 6, label: 'Bem', color: 'bg-blue-400', emoji: '🙂', textColor: 'text-blue-600', alertLevel: 'low' },
  { value: 7, label: 'Muito Bem', color: 'bg-green-400', emoji: '😊', textColor: 'text-green-600', alertLevel: 'low' },
  { value: 8, label: 'Ótimo', color: 'bg-green-500', emoji: '😄', textColor: 'text-green-700', alertLevel: 'low' },
  { value: 9, label: 'Excelente', color: 'bg-green-600', emoji: '😁', textColor: 'text-green-800', alertLevel: 'low' },
  { value: 10, label: 'Fantástico', color: 'bg-emerald-600', emoji: '🤩', textColor: 'text-emerald-800', alertLevel: 'low' }
]

interface PatientMoodViewProps {
  patientId: string
}

export function PatientMoodView({ patientId }: PatientMoodViewProps) {
  const [moodEntries, setMoodEntries] = useState<PatientMoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    average: number
    trend: 'improving' | 'declining' | 'stable'
    consecutiveLow: number
    lastEntry: string | null
    alertLevel: 'low' | 'medium' | 'high'
  } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (patientId) {
      loadPatientMoodData()
    }
  }, [patientId])

  const loadPatientMoodData = async () => {
    setIsLoading(true)
    try {
      // Primeiro buscar o patient_id real na tabela patients
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('id', parseInt(patientId))
        .single()

      if (patientError || !patientData) {
        console.error('Erro ao encontrar paciente:', patientError)
        setMoodEntries([])
        setAnalysis(null)
        setIsLoading(false)
        return
      }

      // Agora buscar os dados de humor
      const { data: moodData, error } = await supabase
        .from('patient_mood_diary')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('diary_date', { ascending: false })
        .limit(30)

      if (error) {
        console.error('Erro ao carregar dados de humor:', error)
        setMoodEntries([])
        setAnalysis(null)
        setIsLoading(false)
        return
      }

      const formattedEntries: PatientMoodEntry[] = (moodData || []).map((entry: DiarioHumor) => {
        const moodLevel = moodLevels.find(m => m.value === entry.mood_rating) || moodLevels[4]
        return {
          date: entry.diary_date,
          mood: entry.mood_rating || 5,
          notes: entry.notes || '',
          color: moodLevel.color,
          emoji: moodLevel.emoji,
          label: moodLevel.label
        }
      })

      setMoodEntries(formattedEntries)
      analyzePatientMood(formattedEntries)
    } catch (error) {
      console.error('Erro ao carregar dados de humor:', error)
      setMoodEntries([])
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzePatientMood = (entries: PatientMoodEntry[]) => {
    if (entries.length === 0) {
      setAnalysis(null)
      return
    }

    const average = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length

    const recent7 = entries.slice(0, 7)
    const older7 = entries.slice(7, 14)
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (recent7.length >= 3 && older7.length >= 3) {
      const recentAvg = recent7.reduce((sum, entry) => sum + entry.mood, 0) / recent7.length
      const olderAvg = older7.reduce((sum, entry) => sum + entry.mood, 0) / older7.length
      const diff = recentAvg - olderAvg
      
      if (diff > 0.5) trend = 'improving'
      else if (diff < -0.5) trend = 'declining'
    }

    let consecutiveLow = 0
    for (const entry of entries) {
      if (entry.mood <= 3) {
        consecutiveLow++
      } else {
        break
      }
    }

    let alertLevel: 'low' | 'medium' | 'high' = 'low'
    if (consecutiveLow >= 3 || average < 3) {
      alertLevel = 'high'
    } else if (consecutiveLow >= 2 || average < 4 || trend === 'declining') {
      alertLevel = 'medium'
    }

    setAnalysis({
      average: parseFloat(average.toFixed(1)),
      trend,
      consecutiveLow,
      lastEntry: entries[0]?.date || null,
      alertLevel
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getLast7Days = () => {
    return moodEntries.slice(0, 7)
  }

  const getTrendIcon = () => {
    if (!analysis) return null
    
    switch (analysis.trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'declining':
        return <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />
    }
  }

  const getAlertComponent = () => {
    if (!analysis || analysis.alertLevel === 'low') return null

    const alertConfig = {
      high: {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: '⚠️ Atenção Necessária',
        message: analysis.consecutiveLow >= 3 
          ? `Paciente registrou humor baixo por ${analysis.consecutiveLow} dias consecutivos`
          : 'Humor médio baixo (< 3). Considere avaliação mais detalhada.'
      },
      medium: {
        icon: Info,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: '💡 Acompanhamento Recomendado',
        message: analysis.trend === 'declining' 
          ? 'Tendência de declínio no humor recente'
          : 'Humor tem se mantido em níveis moderados/baixos'
      }
    }

    const config = alertConfig[analysis.alertLevel as keyof typeof alertConfig]
    const IconComponent = config.icon

    return (
      <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <IconComponent className={`h-5 w-5 ${config.color} mt-0.5`} />
            <div>
              <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{config.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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

  if (moodEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-pink-500" />
            Registro de Humor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Este paciente ainda não registrou dados de humor</p>
            <p className="text-sm text-gray-400 mt-1">
              Incentive o paciente a usar o diário de humor na área pessoal
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {getAlertComponent()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Humor Médio</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analysis?.average || '0'}/10
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Últimos {moodEntries.length} registros
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {getTrendIcon()}
              <span className="text-sm font-medium text-gray-600 ml-2">Tendência</span>
            </div>
            <div className={`text-lg font-semibold capitalize ${
              analysis?.trend === 'improving' ? 'text-green-600' :
              analysis?.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {analysis?.trend === 'improving' ? 'Melhorando' :
               analysis?.trend === 'declining' ? 'Declinando' : 'Estável'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Últimos 7 vs 14 dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Último Registro</span>
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {analysis?.lastEntry ? formatDate(analysis.lastEntry) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {moodEntries.length} total de registros
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-pink-500" />
            Evolução dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {getLast7Days().map((entry, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">
                  {formatDate(entry.date)}
                </div>
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${entry.color}`}>
                  <span className="text-lg">{entry.emoji}</span>
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {entry.mood}/10
                </div>
                <div className="text-xs text-gray-500">
                  {entry.label}
                </div>
              </div>
            ))}
          </div>

          <div className="h-32 flex items-end space-x-2 border-l border-b border-gray-200 pl-2 pb-2">
            {getLast7Days().reverse().map((entry, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${entry.color} rounded-t`}
                  style={{ height: `${(entry.mood / 10) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2 writing-mode-vertical-lr transform rotate-180">
                  {entry.date.split('-').slice(1).join('/')}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Escala: 1 (Muito Ruim) - 10 (Fantástico)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Histórico Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {moodEntries.slice(0, 10).map((entry, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.color}`}>
                    <span className="text-lg">{entry.emoji}</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                    <span className={`text-sm font-semibold ${moodLevels[entry.mood - 1]?.textColor}`}>
                      {entry.mood}/10 - {entry.label}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {moodEntries.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Mostrando 10 de {moodEntries.length} registros
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 