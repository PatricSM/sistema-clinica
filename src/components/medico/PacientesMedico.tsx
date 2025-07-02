'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { createClient } from '@/utils/supabase/client'
import { 
  Search, 
  Filter, 
  User,
  Phone,
  Calendar,
  FileText,
  Eye,
  Plus,
  AlertTriangle,
  Clock,
  MessageCircle
} from 'lucide-react'
import { ProntuarioPaciente } from './ProntuarioPaciente'

interface PacienteMedico {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  status: string
  created_at: string
  ultima_consulta?: string
  proxima_consulta?: string
  total_consultas: number
  prontuario_atualizado: boolean
  observacao_urgente?: string
}

export function PacientesMedico() {
  const { user } = useCustomAuth()
  const supabase = createClient()
  const [pacientes, setPacientes] = useState<PacienteMedico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null)

  useEffect(() => {
    const loadPacientes = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Buscar professional_id do usuário
        const { data: professionalData, error: profError } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (profError) {
          console.error('Erro ao buscar dados do profissional:', profError)
          setIsLoading(false)
          return
        }

        // Buscar pacientes através dos appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            patient_id,
            start_time,
            status,
            patient:patients!inner(
              id,
              user_id,
              date_of_birth,
              gender,
              cpf,
              status,
              created_at,
              users!inner(full_name, email, phone)
            )
          `)
          .eq('professional_id', professionalData.id)
          .order('start_time', { ascending: false })

        if (appointmentsError) {
          console.error('Erro ao buscar appointments:', appointmentsError)
          setIsLoading(false)
          return
        }

        // Buscar dados do prontuário para cada paciente
        const pacientesUnicos = new Map<string, any>()
        const appointmentsPorPaciente = new Map<string, any[]>()

        // Agrupar appointments por paciente
        appointmentsData?.forEach((appointment: any) => {
          const patientId = appointment.patient.id.toString()
          
          if (!pacientesUnicos.has(patientId)) {
            pacientesUnicos.set(patientId, appointment.patient)
          }

          if (!appointmentsPorPaciente.has(patientId)) {
            appointmentsPorPaciente.set(patientId, [])
          }
          appointmentsPorPaciente.get(patientId)?.push(appointment)
        })

        // Buscar prontuários
        const { data: prontuariosData } = await supabase
          .from('medical_records')
          .select('patient_id, record_date')
          .eq('professional_id', professionalData.id)
          .order('record_date', { ascending: false })

        const prontuariosPorPaciente = new Map<string, any[]>()
        prontuariosData?.forEach((record: any) => {
          const patientId = record.patient_id.toString()
          if (!prontuariosPorPaciente.has(patientId)) {
            prontuariosPorPaciente.set(patientId, [])
          }
          prontuariosPorPaciente.get(patientId)?.push(record)
        })

        // Formatar dados dos pacientes
        const pacientesFormatados: PacienteMedico[] = Array.from(pacientesUnicos.values()).map((patient: any) => {
          const patientId = patient.id.toString()
          const appointments = appointmentsPorPaciente.get(patientId) || []
          const prontuarios = prontuariosPorPaciente.get(patientId) || []

          // Calcular última e próxima consulta
          const hoje = new Date()
          const consultasPassadas = appointments.filter(a => new Date(a.start_time) < hoje)
          const consultasFuturas = appointments.filter(a => new Date(a.start_time) > hoje)

          const ultimaConsulta = consultasPassadas[0]?.start_time
          const proximaConsulta = consultasFuturas[consultasFuturas.length - 1]?.start_time

          // Verificar se prontuário está atualizado
          const ultimoProntuario = prontuarios[0]?.record_date
          const prontuarioAtualizado = ultimaConsulta && ultimoProntuario 
            ? new Date(ultimoProntuario) >= new Date(ultimaConsulta) 
            : true

          return {
            id: patientId,
            name: patient.users.full_name,
            email: patient.users.email,
            phone: patient.users.phone,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender || 'Não informado',
            status: patient.status || 'active',
            created_at: patient.created_at,
            ultima_consulta: ultimaConsulta,
            proxima_consulta: proximaConsulta,
            total_consultas: appointments.length,
            prontuario_atualizado: prontuarioAtualizado
          }
        })

        setPacientes(pacientesFormatados)
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPacientes()
  }, [user, supabase])

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    // Filtro de busca
    if (busca) {
      const searchTerm = busca.toLowerCase()
      if (!paciente.name.toLowerCase().includes(searchTerm) &&
          !paciente.email.toLowerCase().includes(searchTerm) &&
          !paciente.phone.includes(searchTerm)) {
        return false
      }
    }
    
    // Filtro de status
    if (statusFilter !== 'all' && paciente.status !== statusFilter) {
      return false
    }
    
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysFromLastConsult = (lastConsult?: string) => {
    if (!lastConsult) return null
    const hoje = new Date()
    const ultima = new Date(lastConsult)
    const diffTime = Math.abs(hoje.getTime() - ultima.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Se um paciente foi selecionado, mostrar o prontuário
  if (selectedPacienteId) {
    return (
      <ProntuarioPaciente 
        pacienteId={selectedPacienteId} 
        onBack={() => setSelectedPacienteId(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pacientes</h1>
          <p className="text-gray-600">
            {pacientesFiltrados.length} de {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtro Status */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card>
        <CardContent className="p-0">
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {pacientes.length === 0 ? 'Nenhum paciente encontrado' : 'Nenhum resultado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {pacientes.length === 0 
                  ? 'Você ainda não tem pacientes atribuídos.'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pacientesFiltrados.map((paciente) => {
                const diasUltimaConsulta = getDaysFromLastConsult(paciente.ultima_consulta)
                
                return (
                  <div key={paciente.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        {/* Informações do Paciente */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{paciente.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(paciente.status)}`}>
                              {paciente.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            {paciente.observacao_urgente && (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs">Atenção</span>
                              </div>
                            )}
                            {!paciente.prontuario_atualizado && (
                              <div className="flex items-center space-x-1 text-yellow-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Prontuário pendente</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{calculateAge(paciente.date_of_birth)} anos • {paciente.gender}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{formatPhone(paciente.phone)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{paciente.total_consultas} consultas</span>
                            </div>
                          </div>

                          {/* Informações de Consultas */}
                          <div className="mt-2 flex items-center space-x-6 text-sm">
                            {paciente.ultima_consulta && (
                              <div className="text-gray-600">
                                <span className="font-medium">Última:</span>{' '}
                                {formatDate(paciente.ultima_consulta)}
                                {diasUltimaConsulta && (
                                  <span className="text-gray-500"> ({diasUltimaConsulta} dias)</span>
                                )}
                              </div>
                            )}
                            {paciente.proxima_consulta && (
                              <div className="text-blue-600">
                                <span className="font-medium">Próxima:</span>{' '}
                                {formatDate(paciente.proxima_consulta)}
                              </div>
                            )}
                          </div>

                          {paciente.observacao_urgente && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                              <MessageCircle className="w-4 h-4 inline mr-1" />
                              {paciente.observacao_urgente}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => setSelectedPacienteId(paciente.id)}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Prontuário</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Agendar</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>Registrar Sessão</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pacientes Ativos</p>
                <p className="text-lg font-semibold">
                  {pacientes.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prontuários Pendentes</p>
                <p className="text-lg font-semibold">
                  {pacientes.filter(p => !p.prontuario_atualizado).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Próximas Consultas</p>
                <p className="text-lg font-semibold">
                  {pacientes.filter(p => p.proxima_consulta).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 