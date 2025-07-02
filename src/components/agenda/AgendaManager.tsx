'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar,
  Filter,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Stethoscope
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AgendaCalendar } from './AgendaCalendar'
import { ConsultaForm, type ConsultaFormData } from './ConsultaForm'
import { ConsultaView } from './ConsultaView'
import type { Consulta, AppointmentStatus } from '@/types'

type View = 'calendar' | 'create' | 'edit' | 'view'

interface AgendaManagerProps {
  className?: string
}

import { supabase } from '@/lib/supabase'

interface ProfessionalInfo {
  id: number
  name: string
  specialty: string
  color: string
}

export function AgendaManager({ className }: AgendaManagerProps) {
  const [view, setView] = useState<View>('calendar')
  const [consultas, setConsultas] = useState<(Consulta & { patient_name?: string, professional_name?: string, duration?: number })[]>([])
  const [professionals, setProfessionals] = useState<ProfessionalInfo[]>([])
  const [selectedConsulta, setSelectedConsulta] = useState<typeof consultas[0] | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all')
  const [initialDate, setInitialDate] = useState<Date | null>(null)
  const [initialTime, setInitialTime] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar dados do Supabase
  useEffect(() => {
    fetchProfessionals()
    fetchConsultas()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          id,
          specialty,
          users!inner(full_name)
        `)

      if (error) throw error

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
      const professionalData: ProfessionalInfo[] = data?.map((prof: any, index) => ({
        id: prof.id,
        name: prof.users?.full_name || 'Nome não disponível',
        specialty: prof.specialty || 'Psicologia',
        color: colors[index % colors.length]
      })) || []

      setProfessionals(professionalData)
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    }
  }

  const fetchConsultas = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          professional_id,
          start_time,
          end_time,
          status,
          notes,
          created_at,
          updated_at,
          patient:patients!inner(
            user:users!inner(full_name)
          ),
          professional:professionals!inner(
            users!inner(full_name)
          )
        `)
        .order('start_time', { ascending: true })

      if (error) throw error

      const consultaData = data?.map((apt: any) => {
        const startTime = new Date(apt.start_time)
        const endTime = new Date(apt.end_time)
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

        return {
          id: apt.id,
          patient_id: apt.patient_id,
          professional_id: apt.professional_id,
          start_time: apt.start_time,
          end_time: apt.end_time,
          status: apt.status,
          notes: apt.notes,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          patient_name: apt.patient?.user?.full_name || 'Paciente não identificado',
          professional_name: apt.professional?.users?.full_name || 'Profissional não identificado',
          duration
        }
      }) || []

      setConsultas(consultaData)
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Estatísticas da agenda
  const getStatistics = () => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    const thisWeekConsultas = consultas.filter(c => {
      const consultaDate = new Date(c.start_time)
      return consultaDate >= startOfWeek && consultaDate <= endOfWeek
    })

    return {
      total: consultas.length,
      thisWeek: thisWeekConsultas.length,
      scheduled: consultas.filter(c => c.status === 'scheduled').length,
      confirmed: consultas.filter(c => c.status === 'confirmed').length,
      completed: consultas.filter(c => c.status === 'completed').length,
      cancelled: consultas.filter(c => c.status === 'cancelled').length,
      todayConsultas: consultas.filter(c => {
        const consultaDate = new Date(c.start_time)
        const today = new Date()
        return consultaDate.toDateString() === today.toDateString()
      })
    }
  }

  const stats = getStatistics()

  // Handlers para CRUD de consultas
  const handleCreateConsulta = (date?: Date, time?: string) => {
    setInitialDate(date || new Date())
    setInitialTime(time)
    setSelectedConsulta(null)
    setView('create')
  }

  const handleEditConsulta = (consulta: typeof consultas[0]) => {
    setSelectedConsulta(consulta)
    setInitialDate(null)
    setInitialTime(undefined)
    setView('edit')
  }

  const handleViewConsulta = (consulta: typeof consultas[0]) => {
    setSelectedConsulta(consulta)
    setView('view')
  }

  const handleSaveConsulta = async (data: ConsultaFormData) => {
    setIsLoading(true)
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (selectedConsulta) {
        // Atualizar consulta existente
        setConsultas(prev => prev.map(c => 
          c.id === selectedConsulta.id 
            ? { ...c, ...data, updated_at: new Date().toISOString() }
            : c
        ))
      } else {
        // Criar nova consulta
        const newConsulta = {
          id: Date.now(), // ID temporário
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: data.duration || 50
        }
        setConsultas(prev => [...prev, newConsulta])
      }
      
      setView('calendar')
      setSelectedConsulta(null)
    } catch (error) {
      console.error('Erro ao salvar consulta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConsulta = () => {
    if (selectedConsulta) {
      setConsultas(prev => prev.filter(c => c.id !== selectedConsulta.id))
      setView('calendar')
      setSelectedConsulta(null)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (selectedConsulta) {
      setConsultas(prev => prev.map(c => 
        c.id === selectedConsulta.id 
          ? { ...c, status: newStatus as AppointmentStatus, updated_at: new Date().toISOString() }
          : c
      ))
      
      // Atualizar consulta selecionada para refletir mudança
      setSelectedConsulta(prev => prev ? 
        { ...prev, status: newStatus as AppointmentStatus, updated_at: new Date().toISOString() }
        : null
      )
    }
  }

  const handleBackToCalendar = () => {
    setView('calendar')
    setSelectedConsulta(null)
    setInitialDate(null)
    setInitialTime(undefined)
  }

  // Renderização condicional das views
  const renderView = () => {
    switch (view) {
      case 'create':
      case 'edit':
        return (
          <ConsultaForm
            consulta={view === 'edit' ? selectedConsulta : null}
            initialDate={initialDate || undefined}
            initialTime={initialTime}
            onSave={handleSaveConsulta}
            onCancel={handleBackToCalendar}
            isLoading={isLoading}
          />
        )
      
      case 'view':
        return selectedConsulta ? (
          <ConsultaView
            consulta={selectedConsulta}
            onEdit={() => handleEditConsulta(selectedConsulta)}
            onDelete={handleDeleteConsulta}
            onBack={handleBackToCalendar}
            onStatusChange={handleStatusChange}
          />
        ) : null
      
      default:
        return (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Realizadas</p>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Agendadas</p>
                      <p className="text-2xl font-bold">{stats.scheduled + stats.confirmed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Canceladas</p>
                      <p className="text-2xl font-bold">{stats.cancelled}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <CardTitle>Filtros da Agenda</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.todayConsultas.length} consultas hoje
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedProfessional}
                      onChange={(e) => setSelectedProfessional(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os profissionais</option>
                      {professionals.map(prof => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name} - {prof.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Visualizando:</span>
                    <span className="font-medium">
                      {selectedProfessional === 'all' 
                        ? 'Todos os profissionais' 
                        : professionals.find(p => p.id === selectedProfessional)?.name
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendário */}
            <AgendaCalendar
              onCreateConsulta={handleCreateConsulta}
              onEditConsulta={handleEditConsulta}
              onViewConsulta={handleViewConsulta}
              selectedProfessional={selectedProfessional}
            />
          </div>
        )
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header principal */}
      {view === 'calendar' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600">
              Gerencie consultas e horários dos profissionais
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{stats.thisWeek} consultas esta semana</span>
            </div>
            
            <Button onClick={() => handleCreateConsulta()}>
              <Calendar className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </div>
      )}

      {/* Renderizar view atual */}
      {renderView()}
    </div>
  )
} 