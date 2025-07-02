'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Heart, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  BarChart3,
  Clock,
  Smile,
  Meh,
  Frown
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { DiarioHumor } from '@/types'

interface MoodEntry {
  date: string
  mood: number
  notes: string
  color: string
  emoji: string
  label: string
}

const moodLevels = [
  { value: 1, label: 'Muito Ruim', color: 'bg-red-600', emoji: '😢', textColor: 'text-red-600' },
  { value: 2, label: 'Ruim', color: 'bg-red-400', emoji: '😞', textColor: 'text-red-400' },
  { value: 3, label: 'Baixo', color: 'bg-orange-400', emoji: '😕', textColor: 'text-orange-400' },
  { value: 4, label: 'Regular', color: 'bg-yellow-400', emoji: '😐', textColor: 'text-yellow-600' },
  { value: 5, label: 'Neutro', color: 'bg-gray-400', emoji: '😶', textColor: 'text-gray-600' },
  { value: 6, label: 'Bem', color: 'bg-blue-400', emoji: '🙂', textColor: 'text-blue-600' },
  { value: 7, label: 'Muito Bem', color: 'bg-green-400', emoji: '😊', textColor: 'text-green-600' },
  { value: 8, label: 'Ótimo', color: 'bg-green-500', emoji: '😄', textColor: 'text-green-700' },
  { value: 9, label: 'Excelente', color: 'bg-green-600', emoji: '😁', textColor: 'text-green-800' },
  { value: 10, label: 'Fantástico', color: 'bg-emerald-600', emoji: '🤩', textColor: 'text-emerald-800' }
]

export function MoodDiary() {
  const { user } = useCustomAuth()
  const [currentView, setCurrentView] = useState<'today' | 'history' | 'chart'>('today')
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<DiarioHumor | null>(null)
  const [selectedMood, setSelectedMood] = useState<number>(5)
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [patientId, setPatientId] = useState<number | null>(null)
  
  const supabase = createClient()



  useEffect(() => {
    if (user && user.role === 'patient') {
      loadPatientData()
    }
  }, [user])

  const loadPatientData = async () => {
    if (!user || user.role !== 'patient') return

    try {
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error || !patientData) {
        console.error('Erro ao carregar dados do paciente:', error)
        return
      }

      setPatientId(patientData.id)
      // Carregar dados de humor após obter o patient_id
      loadMoodData(patientData.id)
      loadTodayMood(patientData.id)
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error)
    }
  }

  const loadMoodData = async (patientIdParam?: number) => {
    const currentPatientId = patientIdParam || patientId
    if (!currentPatientId) return

    setIsLoading(true)
    try {
      const { data: moodData, error } = await supabase
        .from('patient_mood_diary')
        .select('*')
        .eq('patient_id', currentPatientId)
        .order('diary_date', { ascending: false })
        .limit(30)

      if (error) {
        console.error('Erro ao carregar dados de humor:', error)
        return
      }

      const formattedEntries: MoodEntry[] = (moodData || []).map((entry: DiarioHumor) => {
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
    } catch (error) {
      console.error('Erro ao carregar dados de humor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTodayMood = async (patientIdParam?: number) => {
    const currentPatientId = patientIdParam || patientId
    if (!currentPatientId) return

    const today = new Date().toISOString().split('T')[0]
    
    try {
      const { data: todayData, error } = await supabase
        .from('patient_mood_diary')
        .select('*')
        .eq('patient_id', currentPatientId)
        .eq('diary_date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar humor de hoje:', error)
        return
      }

      if (todayData) {
        setTodayMood(todayData)
        setSelectedMood(todayData.mood_rating || 5)
        setNotes(todayData.notes || '')
      } else {
        setTodayMood(null)
        setSelectedMood(5)
        setNotes('')
      }
    } catch (error) {
      console.error('Erro ao carregar humor de hoje:', error)
    }
  }

  const saveMoodEntry = async () => {
    if (!patientId) return

    setIsSaving(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      const moodData = {
        patient_id: patientId,
        diary_date: today,
        mood_rating: selectedMood,
        notes: notes.trim()
      }

      let result
      if (todayMood) {
        // Atualizar registro existente
        result = await supabase
          .from('patient_mood_diary')
          .update(moodData)
          .eq('id', todayMood.id)
          .select()
          .single()
      } else {
        // Criar novo registro
        result = await supabase
          .from('patient_mood_diary')
          .insert(moodData)
          .select()
          .single()
      }

      if (result.error) {
        console.error('Erro ao salvar humor:', result.error)
        alert('Erro ao salvar registro. Tente novamente.')
        return
      }

      // Atualizar estado local
      setTodayMood(result.data)
      await loadMoodData()
      
      alert('Humor registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar humor:', error)
      alert('Erro ao salvar registro. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getMoodAverage = () => {
    if (moodEntries.length === 0) return 0
    const sum = moodEntries.reduce((acc, entry) => acc + entry.mood, 0)
    return (sum / moodEntries.length).toFixed(1)
  }

  const getWeeklyEntries = () => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Buscar entrada correspondente com busca mais robusta
      const entry = moodEntries.find(e => {
        // Comparar apenas a parte da data (YYYY-MM-DD)
        const entryDateStr = e.date.split('T')[0]
        return entryDateStr === dateStr
      })
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        mood: entry?.mood || null,
        color: entry?.color || 'bg-gray-200',
        emoji: entry?.emoji || '❓',
        label: entry?.label || 'Não registrado'
      })
    }
    
    return last7Days
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Heart className="mx-auto h-8 w-8 text-pink-500 animate-pulse mb-2" />
          <p>Carregando diário de humor...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Heart className="mr-3 h-6 w-6 text-pink-500" />
          Diário de Humor
        </h1>
        <div className="flex space-x-2">
          <Button
            variant={currentView === 'today' ? 'primary' : 'outline'}
            onClick={() => setCurrentView('today')}
            size="sm"
          >
            <Heart className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button
            variant={currentView === 'history' ? 'primary' : 'outline'}
            onClick={() => setCurrentView('history')}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          <Button
            variant={currentView === 'chart' ? 'primary' : 'outline'}
            onClick={() => setCurrentView('chart')}
            size="sm"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Gráfico
          </Button>
        </div>
      </div>

      {/* Registro de Hoje */}
      {currentView === 'today' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smile className="mr-2 h-5 w-5 text-yellow-500" />
                Como você está se sentindo hoje?
              </CardTitle>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seletor de Humor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível do Humor (1-10)
                </label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {moodLevels.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`
                        p-3 rounded-lg text-center transition-all duration-200 border-2
                        ${selectedMood === mood.value 
                          ? 'border-blue-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">{mood.value}</div>
                      <div className="text-xs text-gray-500">{mood.label}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className={`text-lg font-semibold ${moodLevels[selectedMood - 1]?.textColor}`}>
                    {selectedMood}/10 - {moodLevels[selectedMood - 1]?.label}
                  </span>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como foi seu dia? (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva como você se sentiu hoje, o que aconteceu, como foi seu humor..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {notes.length}/500 caracteres
                </div>
              </div>

              {/* Botão Salvar */}
              <Button
                onClick={saveMoodEntry}
                disabled={isSaving}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                {isSaving ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {todayMood ? 'Atualizar Registro' : 'Salvar Registro'}
                  </>
                )}
              </Button>

              {todayMood && (
                <div className="text-center text-sm text-green-600">
                  ✅ Humor já registrado hoje - você pode atualizar quando quiser
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      {currentView === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                Últimos Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhum registro de humor encontrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Comece registrando seu humor hoje!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moodEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{entry.emoji}</div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(entry.date)}
                          </div>
                          <div className={`text-sm ${moodLevels[entry.mood - 1]?.textColor}`}>
                            {entry.mood}/10 - {entry.label}
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-600 mt-1 italic">
                              "{entry.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${entry.color}`}></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico Semanal */}
      {currentView === 'chart' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Métricas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {getMoodAverage()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Humor Médio (Últimos 30 dias)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {moodEntries.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Dias Registrados
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Última Semana */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                  Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {getWeeklyEntries().map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {day.day}
                      </div>
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${day.color}`}>
                        <span className="text-sm">
                          {day.mood ? day.emoji : '❓'}
                        </span>
                      </div>
                      <div className="text-xs font-medium">
                        {day.mood || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" />
                Evolução do Humor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end space-x-2 border border-gray-200 bg-gray-50 p-4 rounded">
                {getWeeklyEntries().map((day, index) => {
                  const heightPercent = Math.max(((day.mood || 0) / 10) * 100, 4)
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-6 ${day.color} rounded-t`}
                        style={{ 
                          height: `${heightPercent}%`
                        }}
                        title={`${day.day}: ${day.mood ? `${day.mood}/10 - ${day.label}` : 'Sem registro'}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {day.day}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {day.mood || '-'}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Escala: 1 (Muito Ruim) - 10 (Fantástico)
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 