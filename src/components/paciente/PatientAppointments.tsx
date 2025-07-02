'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react'

interface Professional {
  id: number
  specialty?: string
  crp_number: string
  consultation_price?: number
  is_available: boolean
  user: {
    full_name: string
    email: string
    phone?: string
  }
}

interface Appointment {
  id: number
  patient_id: number
  professional_id: number
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  created_at: string
  updated_at: string
  professional: {
    user: {
      full_name: string
      email: string
    }
    specialty?: string
    crp_number: string
  }
}

interface PatientAppointmentsProps {
  patientId?: number
}

export function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar consultas do paciente
  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/patient/appointments')
      const data = await response.json()
      
      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        console.error('Erro ao buscar consultas:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
    }
  }

  // Buscar profissionais disponíveis
  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/patient/professionals')
      const data = await response.json()
      
      if (response.ok) {
        setProfessionals(data.professionals || [])
      } else {
        console.error('Erro ao buscar profissionais:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchAppointments(), fetchProfessionals()])
      setIsLoading(false)
    }
    
    loadData()
  }, [patientId])

  // Solicitar nova consulta
  const handleSubmitAppointment = async () => {
    if (!selectedProfessional || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Criar datetime da consulta
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
      const endTime = new Date(new Date(startTime).getTime() + 50 * 60000).toISOString() // 50 minutos

      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: selectedProfessional,
          start_time: startTime,
          end_time: endTime,
          notes: notes.trim() || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setShowNewAppointmentModal(false)
        resetForm()
        await fetchAppointments() // Atualizar lista
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error)
      alert('Erro ao solicitar consulta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedProfessional(null)
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
  }

  // Filtrar consultas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      appointment.professional.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.professional.specialty && appointment.professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

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
      scheduled: 'Pendente',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Gerar horários disponíveis (8h às 18h, intervalos de 1h)
  const timeSlots = []
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Minhas Consultas</h2>
          <p className="text-gray-600">Visualize seu histórico e solicite novas consultas</p>
        </div>
        <Button onClick={() => setShowNewAppointmentModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Solicitar Consulta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por profissional ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                <option value="scheduled">Pendente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas</CardTitle>
          <CardDescription>
            {filteredAppointments.length} consulta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma consulta encontrada</p>
              <p className="text-sm text-gray-400">Solicite sua primeira consulta clicando no botão acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status)
                return (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.professional.user.full_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.professional.specialty || 'Especialidade não informada'}
                            </p>
                            <p className="text-xs text-gray-500">
                              CRP: {appointment.professional.crp_number}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.start_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Observações:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          Criada em: {formatDateTime(appointment.created_at)}
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          <div className="flex items-center space-x-1">
                            <StatusIcon className="h-3 w-3" />
                            <span>{getStatusLabel(appointment.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nova Consulta */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Solicitar Nova Consulta</h3>
              <button
                onClick={() => {
                  setShowNewAppointmentModal(false)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Seleção de Profissional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissional *
                </label>
                <select
                  value={selectedProfessional || ''}
                  onChange={(e) => setSelectedProfessional(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.user.full_name} - {professional.specialty || 'Psicólogo'}
                      {professional.consultation_price && ` (R$ ${professional.consultation_price})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Horário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um horário</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Descreva brevemente o motivo da consulta ou observações importantes..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Aviso */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Importante:</p>
                    <p>Sua consulta ficará com status "Pendente" até ser confirmada pela secretária ou administrador.</p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewAppointmentModal(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitAppointment}
                  disabled={isSubmitting || !selectedProfessional || !selectedDate || !selectedTime}
                  className="flex-1"
                >
                  {isSubmitting ? 'Solicitando...' : 'Solicitar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
