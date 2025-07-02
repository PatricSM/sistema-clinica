'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Filter,
  Eye,
  Edit,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Consulta, Medico, Paciente } from '@/types'

type ViewMode = 'month' | 'week' | 'day'
type ConsultaExtended = Consulta & {
  patient_name?: string
  professional_name?: string
  duration?: number
}

interface AgendaCalendarProps {
  onCreateConsulta?: (date: Date, time?: string) => void
  onEditConsulta?: (consulta: ConsultaExtended) => void
  onViewConsulta?: (consulta: ConsultaExtended) => void
  selectedProfessional?: number | 'all'
  className?: string
}

// Mock data para demonstração
const mockConsultas: ConsultaExtended[] = [
  {
    id: 1,
    patient_id: 1,
    professional_id: 2,
    start_time: '2024-12-28T09:00:00Z',
    end_time: '2024-12-28T09:50:00Z',
    status: 'confirmed',
    notes: 'Primeira consulta - ansiedade',
    created_at: '2024-12-26T10:00:00Z',
    updated_at: '2024-12-27T15:00:00Z',
    patient_name: 'Ana Silva Costa',
    professional_name: 'Dra. Maria Santos',
    duration: 50
  },
  {
    id: 2,
    patient_id: 2,
    professional_id: 2,
    start_time: '2024-12-28T10:00:00Z',
    end_time: '2024-12-28T10:50:00Z',
    status: 'scheduled',
    notes: 'Sessão de acompanhamento',
    created_at: '2024-12-25T14:00:00Z',
    updated_at: '2024-12-25T14:00:00Z',
    patient_name: 'Carlos Eduardo Santos',
    professional_name: 'Dra. Maria Santos',
    duration: 50
  },
  {
    id: 3,
    patient_id: 3,
    professional_id: 3,
    start_time: '2024-12-28T14:00:00Z',
    end_time: '2024-12-28T14:50:00Z',
    status: 'completed',
    notes: 'Sessão concluída - evolução positiva',
    created_at: '2024-12-20T09:00:00Z',
    updated_at: '2024-12-28T15:00:00Z',
    patient_name: 'Mariana Oliveira Lima',
    professional_name: 'Dr. João Costa',
    duration: 50
  },
  {
    id: 4,
    patient_id: 4,
    professional_id: 2,
    start_time: '2024-12-29T09:00:00Z',
    end_time: '2024-12-29T09:50:00Z',
    status: 'scheduled',
    created_at: '2024-12-27T16:00:00Z',
    updated_at: '2024-12-27T16:00:00Z',
    patient_name: 'Roberto Ferreira Souza',
    professional_name: 'Dra. Maria Santos',
    duration: 50
  },
  {
    id: 5,
    patient_id: 1,
    professional_id: 3,
    start_time: '2024-12-30T15:00:00Z',
    end_time: '2024-12-30T15:50:00Z',
    status: 'cancelled',
    notes: 'Cancelado pelo paciente',
    created_at: '2024-12-25T11:00:00Z',
    updated_at: '2024-12-29T10:00:00Z',
    patient_name: 'Ana Silva Costa',
    professional_name: 'Dr. João Costa',
    duration: 50
  }
]

const mockProfessionals = [
  { id: 2, name: 'Dra. Maria Santos', specialty: 'Psicologia Clínica', color: '#3B82F6' },
  { id: 3, name: 'Dr. João Costa', specialty: 'Neuropsicologia', color: '#10B981' },
  { id: 4, name: 'Dra. Ana Rodrigues', specialty: 'Psicologia Infantil', color: '#F59E0B' },
]

export function AgendaCalendar({ 
  onCreateConsulta, 
  onEditConsulta, 
  onViewConsulta,
  selectedProfessional = 'all',
  className 
}: AgendaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [consultas, setConsultas] = useState<ConsultaExtended[]>(mockConsultas)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar consultas por profissional se selecionado
  const filteredConsultas = selectedProfessional === 'all' 
    ? consultas 
    : consultas.filter(c => c.professional_id === selectedProfessional)

  // Funções utilitárias de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendada',
      confirmed: 'Confirmada',
      completed: 'Realizada',
      cancelled: 'Cancelada',
      no_show: 'Faltou'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      scheduled: Clock,
      confirmed: Check,
      completed: Check,
      cancelled: X,
      no_show: AlertCircle
    }
    return icons[status as keyof typeof icons] || Clock
  }

  // Navegação de datas
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  // Obter consultas para uma data específica
  const getConsultasForDate = (date: Date) => {
    return filteredConsultas.filter(consulta => {
      const consultaDate = new Date(consulta.start_time)
      return isSameDay(consultaDate, date)
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  // Obter dias da semana para visualização semanal
  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day

    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)
      week.push(currentDay)
    }

    return week
  }

  // Obter dias do mês para visualização mensal
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)
    
    // Ajustar para começar na segunda-feira
    const startDay = startDate.getDay()
    startDate.setDate(startDate.getDate() - startDay)
    
    // Ajustar para terminar no domingo
    const endDay = endDate.getDay()
    endDate.setDate(endDate.getDate() + (6 - endDay))
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  // Renderizar consulta
  const renderConsulta = (consulta: ConsultaExtended, compact = false) => {
    const StatusIcon = getStatusIcon(consulta.status)
    const professional = mockProfessionals.find(p => p.id === consulta.professional_id)
    
    return (
      <div
        key={consulta.id}
        className={`p-2 mb-1 rounded border-l-4 cursor-pointer transition-all hover:shadow-sm ${getStatusColor(consulta.status)}`}
        style={{ borderLeftColor: professional?.color || '#6B7280' }}
        onClick={() => onViewConsulta?.(consulta)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <StatusIcon className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                {formatTime(consulta.start_time)}
              </span>
              {!compact && (
                <span className="text-xs text-gray-500">
                  ({consulta.duration}min)
                </span>
              )}
            </div>
            <div className="text-xs truncate font-medium">
              {consulta.patient_name}
            </div>
            {!compact && (
              <div className="text-xs text-gray-600 truncate">
                {consulta.professional_name}
              </div>
            )}
          </div>
          <div className="flex space-x-1 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditConsulta?.(consulta)
              }}
              className="p-1 hover:bg-white/50 rounded"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar visualização de dia
  const renderDayView = () => {
    const consultasDay = getConsultasForDate(currentDate)
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8h às 19h

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="space-y-2">
          {hours.map(hour => {
            const hourConsultas = consultasDay.filter(consulta => {
              const consultaHour = new Date(consulta.start_time).getHours()
              return consultaHour === hour
            })

            return (
              <div key={hour} className="flex border-b border-gray-100 pb-2">
                <div className="w-16 flex-shrink-0 text-sm text-gray-500 pt-1">
                  {hour}:00
                </div>
                <div className="flex-1 min-h-[60px] relative">
                  {hourConsultas.length === 0 ? (
                    <button
                      onClick={() => {
                        const date = new Date(currentDate)
                        date.setHours(hour, 0, 0, 0)
                        onCreateConsulta?.(date, `${hour}:00`)
                      }}
                      className="w-full h-full text-left px-3 py-2 hover:bg-gray-50 rounded text-gray-400 text-sm transition-colors"
                    >
                      Horário livre - Clique para agendar
                    </button>
                  ) : (
                    <div className="space-y-1">
                      {hourConsultas.map(consulta => renderConsulta(consulta))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar visualização de semana
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const hours = Array.from({ length: 12 }, (_, i) => i + 8)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-8 gap-2">
          <div className="text-sm font-medium text-gray-500">Horário</div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-sm font-medium">
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? 'font-bold text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-2 border-b border-gray-100 pb-1">
              <div className="text-xs text-gray-500 pt-1">
                {hour}:00
              </div>
              {weekDays.map(day => {
                const dayConsultas = getConsultasForDate(day).filter(consulta => {
                  const consultaHour = new Date(consulta.start_time).getHours()
                  return consultaHour === hour
                })

                return (
                  <div key={`${day.toISOString()}-${hour}`} className="min-h-[50px]">
                    {dayConsultas.length === 0 ? (
                      <button
                        onClick={() => {
                          const date = new Date(day)
                          date.setHours(hour, 0, 0, 0)
                          onCreateConsulta?.(date, `${hour}:00`)
                        }}
                        className="w-full h-full hover:bg-gray-50 rounded transition-colors text-xs text-gray-300"
                      >
                        +
                      </button>
                    ) : (
                      <div className="space-y-1">
                        {dayConsultas.map(consulta => renderConsulta(consulta, true))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Renderizar visualização de mês
  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate)
    const weeks = []
    
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7))
    }

    return (
      <div className="space-y-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Semanas do mês */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map(day => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = isSameDay(day, new Date())
              const dayConsultas = getConsultasForDate(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-1 border rounded transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} hover:bg-gray-50 cursor-pointer`}
                  onClick={() => {
                    setSelectedDate(day)
                    onCreateConsulta?.(day)
                  }}
                >
                  <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayConsultas.slice(0, 3).map(consulta => renderConsulta(consulta, true))}
                    {dayConsultas.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayConsultas.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {viewMode === 'month' && formatMonthYear(currentDate)}
                  {viewMode === 'week' && `Semana de ${formatDate(getWeekDays(currentDate)[0])}`}
                  {viewMode === 'day' && formatDate(currentDate)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoje
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Controles de visualização */}
              <div className="flex border rounded">
                {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm ${
                      viewMode === mode 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {mode === 'day' && 'Dia'}
                    {mode === 'week' && 'Semana'}
                    {mode === 'month' && 'Mês'}
                  </button>
                ))}
              </div>

              <Button onClick={() => onCreateConsulta?.(new Date())}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Consulta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legendas de status */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded">
            {[
              { status: 'scheduled', label: 'Agendada' },
              { status: 'confirmed', label: 'Confirmada' },
              { status: 'completed', label: 'Realizada' },
              { status: 'cancelled', label: 'Cancelada' }
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded ${getStatusColor(status)} border`}></div>
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Renderização condicional por modo de visualização */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'month' && renderMonthView()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 