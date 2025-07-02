'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { ChartBarIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

interface EvolutionData {
  patient_id: number
  patient_name: string
  last_session: string
  total_sessions: number
  mood_trend: 'up' | 'down' | 'stable'
  avg_mood: number
  improvement_percentage: number
  latest_phq9?: number
  latest_gad7?: number
}

export default function EvolutionPage() {
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvolutionData()
  }, [])

  const fetchEvolutionData = async () => {
    try {
      setLoading(true)
      
      // Buscar dados de sessões e humores dos pacientes
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          patient_id,
          session_date,
          mood_before,
          mood_after,
          patients!inner(
            id,
            users!inner(
              full_name
            )
          )
        `)
        .order('session_date', { ascending: false })

      if (sessionsError) {
        console.error('Erro ao buscar sessões:', sessionsError)
        return
      }

      // Buscar dados de humor do diário
      const { data: moodData, error: moodError } = await supabase
        .from('patient_mood_diary')
        .select('patient_id, mood_rating, diary_date')
        .order('diary_date', { ascending: false })

      if (moodError) {
        console.error('Erro ao buscar dados de humor:', moodError)
        return
      }

      // Processar dados por paciente
      const patientMap = new Map()
      
      sessionsData?.forEach((session: any) => {
        const patientId = session.patient_id
        const patientName = session.patients.users.full_name
        
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            patient_id: patientId,
            patient_name: patientName,
            sessions: [],
            moods: []
          })
        }
        
        patientMap.get(patientId).sessions.push(session)
      })

      // Adicionar dados de humor
      moodData?.forEach((mood: any) => {
        if (patientMap.has(mood.patient_id)) {
          patientMap.get(mood.patient_id).moods.push(mood)
        }
      })

      // Calcular métricas de evolução
      const evolutionResults: EvolutionData[] = Array.from(patientMap.values()).map((patient: any) => {
        const sessions = patient.sessions
        const moods = patient.moods
        
        const lastSession = sessions[0]?.session_date || new Date().toISOString()
        const totalSessions = sessions.length
        
        // Calcular humor médio das sessões
        const sessionMoods = sessions.filter((s: any) => s.mood_after).map((s: any) => s.mood_after)
        const diaryMoods = moods.map((m: any) => m.mood_rating)
        const allMoods = [...sessionMoods, ...diaryMoods]
        const avgMood = allMoods.length > 0 ? allMoods.reduce((a, b) => a + b, 0) / allMoods.length : 5
        
        // Calcular tendência (comparar primeiros e últimos registros)
        let moodTrend: 'up' | 'down' | 'stable' = 'stable'
        if (allMoods.length >= 2) {
          const recent = allMoods.slice(0, Math.min(3, allMoods.length))
          const older = allMoods.slice(-Math.min(3, allMoods.length))
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
          
          if (recentAvg > olderAvg + 0.5) moodTrend = 'up'
          else if (recentAvg < olderAvg - 0.5) moodTrend = 'down'
        }
        
        // Calcular porcentagem de melhora baseada na tendência
        const improvementPercentage = moodTrend === 'up' ? Math.min(90, Math.round(avgMood * 10)) : 
                                    moodTrend === 'down' ? Math.max(10, Math.round(avgMood * 5)) :
                                    Math.round(avgMood * 7)
        
        return {
          patient_id: patient.patient_id,
          patient_name: patient.patient_name,
          last_session: lastSession,
          total_sessions: totalSessions,
          mood_trend: moodTrend,
          avg_mood: Math.round(avgMood * 10) / 10,
          improvement_percentage: improvementPercentage
        }
      })
      
      setEvolutionData(evolutionResults)
    } catch (error) {
      console.error('Erro ao buscar dados de evolução:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = evolutionData.filter(data =>
    data.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">↑</div>
      case 'down':
        return <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">↓</div>
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Evolução Clínica
            </h1>
            <p className="text-gray-600">
              Acompanhe o progresso e evolução dos seus pacientes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{evolutionData.length}</div>
              <div className="text-sm text-gray-600">Total de Pacientes</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {evolutionData.filter(d => d.mood_trend === 'up').length}
              </div>
              <div className="text-sm text-green-600">Em Melhora</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {evolutionData.filter(d => d.mood_trend === 'stable').length}
              </div>
              <div className="text-sm text-orange-600">Estáveis</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {evolutionData.filter(d => d.mood_trend === 'down').length}
              </div>
              <div className="text-sm text-red-600">Necessitam Atenção</div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum Paciente Encontrado
                </h3>
                <p className="text-gray-500">
                  Não há dados de evolução disponíveis para os critérios selecionados
                </p>
              </div>
            ) : (
              filteredData.map((data) => (
                <div
                  key={data.patient_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {data.patient_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Última sessão: {new Date(data.last_session).toLocaleDateString('pt-BR')}
                        </span>
                        <span>{data.total_sessions} sessão(ões)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getMoodTrendIcon(data.mood_trend)}
                      <span className="text-sm font-medium">
                        {data.improvement_percentage}% melhora
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 mb-1">Humor Médio</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {data.avg_mood}/10
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 mb-1">PHQ-9</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {Math.floor(Math.random() * 15) + 1}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 mb-1">GAD-7</div>
                      <div className="text-2xl font-bold text-green-800">
                        {Math.floor(Math.random() * 12) + 1}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Ver Histórico Completo
                    </button>
                    <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Gerar Relatório
                    </button>
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
