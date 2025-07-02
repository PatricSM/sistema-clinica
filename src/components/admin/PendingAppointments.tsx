'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Clock, 
  User, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  Phone,
  Mail
} from 'lucide-react'

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
  patient: {
    user: {
      full_name: string
      email: string
      phone?: string
    }
  }
  professional: {
    user: {
      full_name: string
      email: string
    }
    specialty?: string
    crp_number: string
  }
}

export function PendingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('scheduled')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({})

  // Buscar consultas
  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }

      const response = await fetch(`/api/admin/appointments?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        console.error('Erro ao buscar consultas:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [filterStatus])

  // Atualizar status da consulta
  const updateAppointmentStatus = async (appointmentId: number, newStatus: string, notes?: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [appointmentId]: true }))
      
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        await fetchAppointments() // Recarregar lista
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error)
      alert('Erro ao atualizar consulta. Tente novamente.')
    } finally {
      setIsUpdating(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  // Filtrar consultas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.patient.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.professional.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.professional.specialty && appointment.professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingCount = appointments.filter(app => app.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Consultas</h2>
          <p className="text-gray-600">
            Gerencie as solicitações de consultas dos pacientes
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <Button onClick={fetchAppointments} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
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
                  placeholder="Buscar por paciente, profissional ou especialidade..."
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
                <option value="scheduled">Pendentes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Realizadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            {filteredAppointments.length} consulta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma consulta encontrada</p>
              <p className="text-sm text-gray-400">
                {filterStatus === 'scheduled' 
                  ? 'Não há consultas pendentes no momento' 
                  : 'Tente ajustar os filtros para ver mais resultados'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Paciente */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {appointment.patient.user.full_name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.patient.user.email}</span>
                            </div>
                            {appointment.patient.user.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{appointment.patient.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detalhes da consulta */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.start_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Profissional:</span>
                            <span className="ml-1">{appointment.professional.user.full_name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>{appointment.professional.specialty || 'Psicólogo'}</span>
                            <span className="ml-2">CRP: {appointment.professional.crp_number}</span>
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Observações do paciente:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Solicitada em: {formatDateTime(appointment.created_at)}
                      </div>
                    </div>

                    {/* Status e ações */}
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </div>

                      {appointment.status === 'scheduled' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            disabled={isUpdating[appointment.id]}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            disabled={isUpdating[appointment.id]}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isUpdating[appointment.id] ? (
                              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-4 w-4" />
                            )}
                            Aprovar
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'confirmed' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            disabled={isUpdating[appointment.id]}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            disabled={isUpdating[appointment.id]}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isUpdating[appointment.id] ? (
                              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-4 w-4" />
                            )}
                            Marcar como Realizada
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
