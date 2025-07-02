'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { CalendarDaysIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

interface Appointment {
  id: number
  doctor_name: string
  date: string
  time: string
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
  notes?: string
  type: string
}

export default function AppointmentsPage() {
  const { user } = useCustomAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [patientId, setPatientId] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchPatientId()
    }
  }, [user])

  useEffect(() => {
    if (patientId) {
      fetchAppointments()
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

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals!inner(
            user:users!inner(full_name)
          )
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })

      if (error) throw error

      const formattedAppointments = data?.map(apt => ({
        id: apt.id,
        doctor_name: apt.professional?.user?.full_name || 'Profissional',
        date: apt.start_time.split('T')[0],
        time: apt.start_time.split('T')[1].substring(0, 5),
        status: apt.status,
        notes: apt.notes,
        type: 'Consulta'
      })) || []

      setAppointments(formattedAppointments)
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800'
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'realizado': return 'bg-gray-100 text-gray-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado'
      case 'confirmado': return 'Confirmado'
      case 'realizado': return 'Realizado'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date()
  }

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.date) && apt.status !== 'cancelado')
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.date) || apt.status === 'cancelado')

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
          <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
          <p className="text-gray-600">Acompanhe seus agendamentos e histórico de consultas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Próximas</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'realizado').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas Consultas */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Próximas Consultas</h3>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma consulta agendada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          Dr(a). {appointment.doctor_name}
                        </h4>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </span>
                        <span>{appointment.type}</span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Consultas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Consultas</h3>
          </div>
          
          {pastAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma consulta no histórico</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-medium text-gray-700">
                          Dr(a). {appointment.doctor_name}
                        </h4>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </span>
                        <span>{appointment.type}</span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
