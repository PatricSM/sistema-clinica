'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { 
  Pill, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle,
  Edit,
  Trash2,
  User,
  Activity
} from 'lucide-react'

interface Medication {
  id: number
  patient_id: number
  professional_id: number
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MedicationWithProfessional extends Medication {
  professional: {
    full_name: string
    specialty: string
  }
}

export function MedicationManager() {
  const { user } = useCustomAuth()
  const [medications, setMedications] = useState<MedicationWithProfessional[]>([])
  const [patientId, setPatientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'list' | 'schedule' | 'history'>('list')
  const supabase = createClient()

  // Buscar o patient_id do usuário logado
  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user) return

      try {
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Erro ao buscar patient_id:', error)
          return
        }

        if (patientData) {
          setPatientId(patientData.id)
        }
      } catch (error) {
        console.error('Erro ao buscar patient_id:', error)
      }
    }

    fetchPatientId()
  }, [user, supabase])

  // Buscar medicamentos do paciente
  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('patient_medications')
          .select(`
            *,
            professional:professionals!inner(
              user:users!inner(full_name),
              specialty
            )
          `)
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar medicamentos:', error)
          return
        }

        // Transform data to match interface
        const medicationsWithProfessional: MedicationWithProfessional[] = (data || []).map((med: any) => ({
          ...med,
          professional: {
            full_name: med.professional?.user?.full_name || 'Profissional não encontrado',
            specialty: med.professional?.specialty || 'Especialidade não informada'
          }
        }))

        setMedications(medicationsWithProfessional)
      } catch (error) {
        console.error('Erro ao buscar medicamentos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedications()
  }, [patientId, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const activeMedications = medications.filter(med => med.is_active && !isExpired(med.end_date))
  const inactiveMedications = medications.filter(med => !med.is_active || isExpired(med.end_date))

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando medicamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Medicamentos</h2>
        <p className="text-gray-600">Acompanhe seus medicamentos prescritos e horários</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedView('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedView === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Lista de Medicamentos
        </button>
        <button
          onClick={() => setSelectedView('schedule')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedView === 'schedule'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Horários
        </button>
        <button
          onClick={() => setSelectedView('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedView === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* View Content */}
      {selectedView === 'list' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Pill className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medicamentos Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Próxima Dose</p>
                    <p className="text-sm font-semibold text-gray-900">Em 2 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tratamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Medicamentos Ativos</span>
              </CardTitle>
              <CardDescription>
                Medicações que você está tomando atualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeMedications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum medicamento ativo</h3>
                  <p className="text-gray-600">Você não possui medicamentos ativos no momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMedications.map((medication) => (
                    <div
                      key={medication.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <Pill className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{medication.medication_name}</h4>
                          <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {medication.professional.full_name}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Desde {formatDate(medication.start_date)}
                            </span>
                            {medication.end_date && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Até {formatDate(medication.end_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Ativo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Horários de Medicação</span>
            </CardTitle>
            <CardDescription>
              Seus horários de medicação para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Schedule Timeline */}
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">08:00 - Manhã</h4>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Sertralina 50mg - 1 comprimido</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">14:00 - Tarde</h4>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Alprazolam 0.5mg - Conforme necessário</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">22:00 - Noite</h4>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Melatonina 3mg - 1 comprimido</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Próxima medicação</h5>
                <p className="text-sm text-blue-700">Melatonina 3mg às 22:00 (em 2 horas)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>Histórico de Medicamentos</span>
            </CardTitle>
            <CardDescription>
              Medicamentos anteriores e descontinuados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inactiveMedications.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico</h3>
                <p className="text-gray-600">Não há medicamentos inativos ou descontinuados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inactiveMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-200 rounded-full">
                        <Pill className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">{medication.medication_name}</h4>
                        <p className="text-sm text-gray-500">{medication.dosage} - {medication.frequency}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {medication.professional.full_name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(medication.start_date)} - {medication.end_date ? formatDate(medication.end_date) : 'Descontinuado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired(medication.end_date)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isExpired(medication.end_date) ? 'Expirado' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
