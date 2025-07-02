'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { PhoneIcon, UserCircleIcon, CalendarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

interface Attendance {
  id: number
  patient_name: string
  phone: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
}

export default function SecretaryAttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          patients!inner(
            id,
            users!inner(
              full_name,
              phone
            )
          )
        `)
        .gte('start_time', today)
        .lt('start_time', today + 'T23:59:59')
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return
      }

      const transformedAttendances: Attendance[] = data.map((appointment: any) => {
        const startTime = new Date(appointment.start_time)
        return {
          id: appointment.id,
          patient_name: appointment.patients.users.full_name,
          phone: appointment.patients.users.phone || 'Não informado',
          date: startTime.toLocaleDateString('pt-BR'),
          time: startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: appointment.status,
          notes: appointment.notes
        }
      })

      setAttendances(transformedAttendances)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendanceStatus = async (id: number, newStatus: string) => {
    setAttendances(prev => 
      prev.map(att => 
        att.id === id 
          ? { ...att, status: newStatus as any }
          : att
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'realizado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ausencia':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredAttendances = attendances.filter(att =>
    att.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Atendimentos
            </h1>
            <p className="text-gray-600">
              Gerencie os atendimentos agendados para hoje
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative">
              <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Atendimentos ({filteredAttendances.length})
              </h2>
            </div>

            <div className="p-6">
              {filteredAttendances.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum atendimento encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há atendimentos agendados para hoje
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttendances.map(attendance => (
                    <div
                      key={attendance.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {attendance.date} at {attendance.time}
                            </div>
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(attendance.status)}`}>
                              {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                            </span>
                          </div>

                          <div className="flex items-center mb-2">
                            <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="font-medium text-gray-900">
                              {attendance.patient_name}
                            </h3>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <PhoneIcon className="h-4 w-4 mr-1" /> {attendance.phone}
                          </div>

                          {attendance.notes && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                              <strong>Observações:</strong> {attendance.notes}
                            </p>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          {attendance.status === 'scheduled' && (
                            <button
                              onClick={() => updateAttendanceStatus(attendance.id, 'confirmed')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                          
                          {(attendance.status === 'scheduled' || attendance.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => updateAttendanceStatus(attendance.id, 'completed')}
                                className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                              >
                                Presente
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(attendance.id, 'no_show')}
                                className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                              >
                                Ausência
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(attendance.id, 'cancelled')}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
