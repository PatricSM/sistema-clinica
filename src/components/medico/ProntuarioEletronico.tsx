'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Stethoscope, 
  Upload,
  Eye,
  Edit3,
  Clock,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { SessionForm } from './SessionForm'

interface MedicalRecord {
  id: number
  patient_id: number
  professional_id: number
  record_date: string
  session_notes: string
  observations: string
  created_at: string
  updated_at: string
  patient_name?: string
  diagnoses?: Diagnosis[]
  documents?: Document[]
}

interface Diagnosis {
  id: number
  code: string
  description: string
  type: 'CID-10' | 'DSM-5'
}

interface Document {
  id: number
  title: string
  file_url?: string
  document_type: string
  created_at: string
}

interface Patient {
  id: number
  user_id: number
  full_name: string
  date_of_birth?: string
  cpf?: string
  phone?: string
  total_sessions?: number
}

type ProntuarioView = 'list' | 'patient-select' | 'session-form' | 'session-view'

interface ProntuarioEletronicoProps {
  initialPatientId?: number
  onBack?: () => void
}

export function ProntuarioEletronico({ initialPatientId, onBack }: ProntuarioEletronicoProps) {
  const [currentView, setCurrentView] = useState<ProntuarioView>(initialPatientId ? 'list' : 'patient-select')
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(initialPatientId || null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [diagnosisFilter, setDiagnosisFilter] = useState('')

  const { user } = useCustomAuth()
  const supabase = createClient()

  useEffect(() => {
    if (currentView === 'patient-select') {
      loadPatients()
    } else if (currentView === 'list' && selectedPatientId) {
      loadMedicalRecords()
    }
    loadDiagnoses()
  }, [currentView, selectedPatientId])

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      // Buscar pacientes do médico através dos appointments
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patients!inner(
            id,
            user_id,
            date_of_birth,
            cpf,
            users!inner(full_name, phone)
          )
        `)
        .eq('professional_id', user?.id)

      if (error) {
        console.error('Erro ao carregar pacientes:', error)
        return
      }

      // Remover pacientes duplicados e formatar
      const pacientesUnicos = new Map()
      appointmentsData?.forEach((appointment: any) => {
        const p = appointment.patient
        if (!pacientesUnicos.has(p.id)) {
          pacientesUnicos.set(p.id, {
            id: p.id,
            user_id: p.user_id,
            full_name: p.users.full_name,
            date_of_birth: p.date_of_birth,
            cpf: p.cpf,
            phone: p.users.phone,
            total_sessions: 0 // Será calculado depois
          })
        }
      })

      setPatients(Array.from(pacientesUnicos.values()))
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedicalRecords = async () => {
    if (!selectedPatientId || !user?.id) return

    setIsLoading(true)
    try {
      const { data: recordsData, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients!inner(
            users!inner(full_name)
          )
        `)
        .eq('patient_id', selectedPatientId)
        .eq('professional_id', user.id)
        .order('record_date', { ascending: false })

      if (error) {
        console.error('Erro ao carregar prontuário:', error)
        return
      }

      const formattedRecords = recordsData?.map((record: any) => ({
        ...record,
        patient_name: record.patients.users.full_name,
        diagnoses: [],
        documents: []
      })) || []

      setMedicalRecords(formattedRecords)
    } catch (error) {
      console.error('Erro ao carregar prontuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDiagnoses = async () => {
    try {
      const { data: diagnosesData, error } = await supabase
        .from('diagnoses')
        .select('*')
        .order('type', { ascending: true })
        .order('code', { ascending: true })

      if (error) {
        console.error('Erro ao carregar diagnósticos:', error)
        return
      }

      setDiagnoses(diagnosesData || [])
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPatientAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.session_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.observations?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = dateFilter === '' || 
      record.record_date.startsWith(dateFilter)
    
    return matchesSearch && matchesDate
  })

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  // Renderização da seleção de paciente
  if (currentView === 'patient-select') {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Selecionar Paciente para Prontuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando pacientes...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum paciente encontrado</p>
                <p className="text-sm text-gray-400">Verifique se há pacientes cadastrados para você</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map(patient => (
                  <Card 
                    key={patient.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={() => {
                      setSelectedPatientId(patient.id)
                      setCurrentView('list')
                    }}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{patient.full_name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {patient.date_of_birth && (
                          <p>Idade: {getPatientAge(patient.date_of_birth)} anos</p>
                        )}
                        {patient.phone && (
                          <p>Telefone: {patient.phone}</p>
                        )}
                        <p>Sessões: {patient.total_sessions || 0}</p>
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Acessar Prontuário
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderização da lista do prontuário
  if (currentView === 'list') {
    return (
      <div className="space-y-6">
        {/* Header com informações do paciente */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setCurrentView('patient-select')} 
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Trocar Paciente
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            )}
          </div>
          <Button 
            onClick={() => setCurrentView('session-form')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Sessão
          </Button>
        </div>

        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Prontuário de {selectedPatient.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Idade</p>
                <p className="font-semibold">{getPatientAge(selectedPatient.date_of_birth)} anos</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="font-semibold">{selectedPatient.cpf || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold">{selectedPatient.phone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Sessões</p>
                <p className="font-semibold">{medicalRecords.length}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e busca */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar nas anotações
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Buscar em sessões e observações..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por mês
                </label>
                <input
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setDateFilter('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de sessões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Histórico de Sessões ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando prontuário...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {medicalRecords.length === 0 
                    ? 'Nenhuma sessão registrada'
                    : 'Nenhuma sessão encontrada com os filtros aplicados'
                  }
                </p>
                <Button 
                  onClick={() => setCurrentView('session-form')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Sessão
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record, index) => (
                  <div 
                    key={record.id}
                    className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 p-4 rounded-r-lg cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedRecord(record)
                      setCurrentView('session-view')
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">
                          Sessão #{medicalRecords.length - index}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(record.record_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                    
                    {record.session_notes && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Anotações da Sessão:</p>
                        <p className="text-gray-800 line-clamp-3">
                          {record.session_notes.length > 150 
                            ? record.session_notes.substring(0, 150) + '...'
                            : record.session_notes
                          }
                        </p>
                      </div>
                    )}

                    {record.observations && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Observações:</p>
                        <p className="text-gray-800 line-clamp-2">
                          {record.observations.length > 100 
                            ? record.observations.substring(0, 100) + '...'
                            : record.observations
                          }
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Criado em: {formatDateTime(record.created_at)}</span>
                      {record.updated_at !== record.created_at && (
                        <span>Última edição: {formatDateTime(record.updated_at)}</span>
                      )}
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

  // Renderização das views de formulário e visualização
  if (currentView === 'session-form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            onClick={() => setCurrentView('list')}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Prontuário
          </Button>
        </div>
        
        {selectedPatient && (
          <SessionForm
            patientId={selectedPatientId!}
            patientName={selectedPatient.full_name}
            onSubmit={() => {
              loadMedicalRecords()
              setCurrentView('list')
            }}
            onCancel={() => setCurrentView('list')}
          />
        )}
      </div>
    )
  }

  if (currentView === 'session-view') {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            onClick={() => setCurrentView('list')}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Prontuário
          </Button>
        </div>
        
        {selectedRecord && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalhes da Sessão #{medicalRecords.findIndex(r => r.id === selectedRecord.id) + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data da Sessão</label>
                  <p className="text-gray-900">{formatDate(selectedRecord.record_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paciente</label>
                  <p className="text-gray-900">{selectedRecord.patient_name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anotações da Sessão</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.session_notes}</p>
                </div>
              </div>

              {selectedRecord.observations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações Clínicas</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.observations}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Criado em: {formatDateTime(selectedRecord.created_at)}</span>
                {selectedRecord.updated_at !== selectedRecord.created_at && (
                  <span>Última edição: {formatDateTime(selectedRecord.updated_at)}</span>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('list')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar à Lista
                </Button>
                <Button
                  onClick={() => setCurrentView('session-form')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Por enquanto, vamos mostrar as outras views como "em desenvolvimento"
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => setCurrentView('list')}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar ao Prontuário
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              Funcionalidade em desenvolvimento
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Esta funcionalidade será implementada na próxima etapa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 