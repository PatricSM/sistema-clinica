'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Calendar,
  User,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import type { Paciente, FiltrosBusca, PaginationResult, User as UserType } from '@/types'

// Interface para patient com joins do Supabase
interface PatientWithUser {
  id: number
  user_id: number
  date_of_birth?: string
  gender?: string
  cpf?: string
  rg?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  responsible_id?: number
  status: string
  created_at: string
  updated_at: string
  user: UserType
}

interface PacientesListProps {
  onCreateNew?: () => void
  onEdit?: (paciente: Paciente) => void
  onView?: (paciente: Paciente) => void
  onDelete?: (paciente: Paciente) => void
}

export function PacientesList({ onCreateNew, onEdit, onView, onDelete }: PacientesListProps) {
  const [pacientes, setPacientes] = useState<PaginationResult<Paciente>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showActions, setShowActions] = useState<number | null>(null)
  const { user } = useCustomAuth()
  const supabase = createClient()

  // Carregar dados reais do Supabase
  useEffect(() => {
    const loadPacientes = async () => {
      if (!user) return
      
      setIsLoading(true)
      
      try {
        // Buscar pacientes com dados completos
        let query = supabase
          .from('patients')
          .select(`
            *,
            user:users!inner(*)
          `)
          .order('created_at', { ascending: false })

        // Aplicar filtros
        if (statusFilter !== 'all') {
          query = query.eq('user.is_active', statusFilter === 'active')
        }

        const { data: patientsData, error, count } = await query

        if (error) throw error

        // Transformar dados para formato esperado
        const transformedPatients: Paciente[] = (patientsData || []).map((patient: PatientWithUser): Paciente => ({
          id: patient.user.id,
          full_name: patient.user.full_name,
          email: patient.user.email,
          phone: patient.user.phone,
          address: patient.user.address,
          role: 'patient' as const,
          is_active: patient.user.is_active,
          avatar_url: patient.user.avatar_url,
          last_login: patient.user.last_login,
          email_verified: patient.user.email_verified,
          email_verified_at: patient.user.email_verified_at,
          created_at: patient.user.created_at,
          updated_at: patient.user.updated_at,
          patient_data: {
            id: patient.id,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            cpf: patient.cpf,
            rg: patient.rg,
            emergency_contact_name: patient.emergency_contact_name,
            emergency_contact_phone: patient.emergency_contact_phone,
            responsible_id: patient.responsible_id,
            status: patient.status as 'active' | 'inactive' | 'suspended'
          }
        }))

        // Aplicar filtro de busca no frontend (pode ser melhorado para backend)
        let filteredData = transformedPatients
        if (searchTerm) {
          filteredData = transformedPatients.filter((p: Paciente) => 
            p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.phone && p.phone.includes(searchTerm)) ||
            p.patient_data?.cpf?.includes(searchTerm)
          )
        }
        
        setPacientes({
          data: filteredData,
          total: filteredData.length,
          page: 1,
          limit: 50,
          total_pages: Math.ceil(filteredData.length / 50),
          has_next: false,
          has_prev: false
        })
        
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error)
        setPacientes({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0,
          has_next: false,
          has_prev: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPacientes()
  }, [searchTerm, statusFilter, user, supabase])

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

  const getStatusBadge = (isActive: boolean, emailVerified: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <UserX className="w-3 h-3 mr-1" />
          Inativo
        </span>
      )
    }
    
    if (!emailVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Mail className="w-3 h-3 mr-1" />
          Não Verificado
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Ativo
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie os pacientes da clínica</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
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
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {pacientes.total} paciente{pacientes.total !== 1 ? 's' : ''} encontrado{pacientes.total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pacientes.data.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum paciente encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece adicionando um novo paciente.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <div className="mt-6">
                  <Button onClick={onCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Paciente
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pacientes.data.map((paciente) => (
                <div key={paciente.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {paciente.full_name}
                            </h3>
                            {getStatusBadge(paciente.is_active, paciente.email_verified)}
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {paciente.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {formatPhone(paciente.phone || '')}
                            </span>
                            {paciente.patient_data?.date_of_birth && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {calculateAge(paciente.patient_data.date_of_birth)} anos
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            Cadastrado em {formatDate(paciente.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView?.(paciente)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(paciente)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowActions(showActions === paciente.id ? null : paciente.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {showActions === paciente.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onDelete?.(paciente)
                                  setShowActions(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {paciente.is_active ? 'Inativar' : 'Ativar'} Paciente
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação (preparado para quando conectar ao banco) */}
      {pacientes.total > pacientes.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pacientes.page - 1) * pacientes.limit) + 1} até {Math.min(pacientes.page * pacientes.limit, pacientes.total)} de {pacientes.total} resultados
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" disabled={!pacientes.has_prev}>
              Anterior
            </Button>
            <Button variant="outline" disabled={!pacientes.has_next}>
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 