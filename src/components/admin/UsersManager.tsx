'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  ToggleLeft,
  ToggleRight,
  Eye,
  UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { UserForm } from './UserForm'
import { hashPassword } from '@/lib/auth'

interface UserData {
  id: number
  full_name: string
  email: string
  phone?: string
  address?: string
  role: 'admin' | 'professional' | 'secretary' | 'patient'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  // Dados específicos por role
  professional_data?: {
    crp_number?: string
    specialty?: string
    consultation_price?: number
  }
  secretary_data?: {
    department?: string
    permissions?: any
  }
  patient_data?: {
    date_of_birth?: string
    gender?: string
    cpf?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
  }
}

type UserView = 'list' | 'create' | 'edit' | 'view'

export function UsersManager() {
  const [currentView, setCurrentView] = useState<UserView>('list')
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useCustomAuth()
  const supabase = createClient()

  // Carregar usuários
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrar usuários quando busca ou filtros mudam
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Buscar dados básicos dos usuários
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar usuários:', error)
        setUsers([])
        return
      }

      setUsers(usersData || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      )
    }

    // Filtro de role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(user => user.is_active === isActive)
    }

    setFilteredUsers(filtered)
  }

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Erro ao alterar status:', error)
        return
      }

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      professional: 'bg-blue-100 text-blue-800 border-blue-200',
      secretary: 'bg-green-100 text-green-800 border-green-200',
      patient: 'bg-purple-100 text-purple-800 border-purple-200'
    }

    const labels = {
      admin: 'Admin',
      professional: 'Médico',
      secretary: 'Secretária',
      patient: 'Paciente'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs border font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Nunca'
    return new Date(lastLogin).toLocaleDateString('pt-BR') + ' às ' + 
           new Date(lastLogin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Função para criar usuário
  const handleCreateUser = async (formData: any) => {
    setIsLoading(true)
    try {
      // Hash da senha
      const passwordHash = await hashPassword(formData.password)

      // Criar usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          password_hash: passwordHash,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
          is_active: formData.is_active,
          email_verified: true
        }])
        .select()
        .single()

      if (userError) {
        console.error('Erro ao criar usuário:', userError)
        return
      }

      // Criar dados específicos do role se necessário
      if (formData.role === 'professional' && userData) {
        const { error: profError } = await supabase
          .from('professionals')
          .insert([{
            user_id: userData.id,
            crp_number: formData.crp_number,
            specialty: formData.specialty,
            consultation_price: formData.consultation_price ? parseFloat(formData.consultation_price) : null
          }])
        
        if (profError) {
          console.error('Erro ao criar dados do profissional:', profError)
        }
      } else if (formData.role === 'secretary' && userData) {
        const { error: secError } = await supabase
          .from('secretaries')
          .insert([{
            user_id: userData.id,
            department: formData.department
          }])
        
        if (secError) {
          console.error('Erro ao criar dados da secretária:', secError)
        }
      } else if (formData.role === 'patient' && userData) {
        const { error: patError } = await supabase
          .from('patients')
          .insert([{
            user_id: userData.id,
            date_of_birth: formData.date_of_birth || null,
            gender: formData.gender || null,
            cpf: formData.cpf || null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null
          }])
        
        if (patError) {
          console.error('Erro ao criar dados do paciente:', patError)
        }
      }

      // Recarregar lista
      await loadUsers()
      setCurrentView('list')
    } catch (error) {
      console.error('Erro geral ao criar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para editar usuário
  const handleEditUser = async (formData: any) => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      // Atualizar dados básicos do usuário
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      // Se senha foi fornecida, atualizar
      if (formData.password) {
        updateData.password_hash = await hashPassword(formData.password)
      }

      const { error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id)

      if (userError) {
        console.error('Erro ao editar usuário:', userError)
        return
      }

      // Recarregar lista
      await loadUsers()
      setCurrentView('list')
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro geral ao editar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (currentView !== 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => {
              setCurrentView('list')
              setSelectedUser(null)
            }}
            variant="outline"
          >
            ← Voltar para Lista
          </Button>
        </div>
        
        {currentView === 'create' && (
          <UserForm
            mode="create"
            onSubmit={handleCreateUser}
            onCancel={() => setCurrentView('list')}
            isLoading={isLoading}
          />
        )}

        {currentView === 'edit' && selectedUser && (
          <UserForm
            mode="edit"
            initialData={selectedUser}
            onSubmit={handleEditUser}
            onCancel={() => {
              setCurrentView('list')
              setSelectedUser(null)
            }}
            isLoading={isLoading}
          />
        )}

        {currentView === 'view' && selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-gray-900">{selectedUser.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="text-gray-900">{selectedUser.phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Perfil</label>
                  <p className="text-gray-900">{getRoleBadge(selectedUser.role)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Último Login</label>
                  <p className="text-gray-900">{formatLastLogin(selectedUser.last_login)}</p>
                </div>
              </div>
              
              {selectedUser.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <p className="text-gray-900">{selectedUser.address}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView('edit')
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setCurrentView('create')}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os perfis</option>
              <option value="admin">Administrador</option>
              <option value="professional">Médico</option>
              <option value="secretary">Secretária</option>
              <option value="patient">Paciente</option>
            </select>

            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Usuários ({filteredUsers.length})</span>
            {isLoading && (
              <div className="animate-pulse bg-gray-200 rounded w-4 h-4"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
              <p className="text-gray-400">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((userData) => (
                <div 
                  key={userData.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {userData.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Informações do usuário */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{userData.full_name}</h3>
                          {getRoleBadge(userData.role)}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            userData.is_active 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {userData.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>{userData.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            {userData.phone && (
                              <span>{userData.phone}</span>
                            )}
                            <span>Último acesso: {formatLastLogin(userData.last_login)}</span>
                            <span>Criado em: {formatDate(userData.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(userData)
                          setCurrentView('view')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(userData)
                          setCurrentView('edit')
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>

                      {userData.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(userData.id, userData.is_active)}
                          className={userData.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {userData.is_active ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
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