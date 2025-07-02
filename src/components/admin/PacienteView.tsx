'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Eye,
  EyeOff,
  Edit,
  X,
  Activity,
  Clock,
  FileText,
  Heart,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Paciente } from '@/types'

interface PacienteViewProps {
  paciente: Paciente
  onEdit?: () => void
  onClose?: () => void
  showActions?: boolean
}

export function PacienteView({ paciente, onEdit, onClose, showActions = true }: PacienteViewProps) {
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado'
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Não informado'
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return `${age} anos`
  }

  const maskSensitiveData = (data: string, show: boolean) => {
    if (!data) return 'Não informado'
    if (show) return data
    
    if (data.includes('.') && data.includes('-')) {
      // CPF ou RG
      return '***.***.***-**'
    }
    return '***********'
  }

  const getStatusInfo = () => {
    if (!paciente.is_active) {
      return {
        icon: UserX,
        text: 'Inativo',
        color: 'text-red-600 bg-red-100',
        description: 'Paciente inativo no sistema'
      }
    }
    
    if (!paciente.email_verified) {
      return {
        icon: AlertTriangle,
        text: 'Email não verificado',
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Email ainda não foi verificado'
      }
    }
    
    return {
      icon: UserCheck,
      text: 'Ativo',
      color: 'text-green-600 bg-green-100',
      description: 'Paciente ativo no sistema'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{paciente.full_name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
              </span>
              <span className="text-sm text-gray-500">
                • ID: {paciente.id}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados Pessoais */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-sm text-gray-900">{paciente.full_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <p className="text-sm text-gray-900">
                    {paciente.patient_data?.date_of_birth 
                      ? `${formatDate(paciente.patient_data.date_of_birth)} (${calculateAge(paciente.patient_data.date_of_birth)})`
                      : 'Não informado'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gênero</label>
                  <p className="text-sm text-gray-900">{paciente.patient_data?.gender || 'Não informado'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900">{statusInfo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status e Ações Rápidas */}
        <div className="space-y-6">
          {/* Resumo de Atividade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Activity className="w-4 h-4 mr-2" />
                Resumo de Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Consultas Realizadas</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Próxima Consulta</span>
                <span className="font-medium">28/12/2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última Visita</span>
                <span className="font-medium">20/12/2024</span>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Ver Prontuário
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-2" />
                Diário de Humor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{paciente.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Telefone</label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{formatPhone(paciente.phone || '')}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Endereço</label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{paciente.address || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos (Dados Sensíveis) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Documentos
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Dados sensíveis protegidos pela LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">CPF</label>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900 font-mono">
                  {maskSensitiveData(paciente.patient_data?.cpf || '', showSensitiveData)}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">RG</label>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900 font-mono">
                  {maskSensitiveData(paciente.patient_data?.rg || '', showSensitiveData)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Contato de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nome</label>
              <p className="text-sm text-gray-900">
                {paciente.patient_data?.emergency_contact_name || 'Não informado'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Telefone</label>
              <p className="text-sm text-gray-900">
                {formatPhone(paciente.patient_data?.emergency_contact_phone || '')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Histórico do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-500">Cadastrado em</label>
              <p className="text-gray-900">{formatDateTime(paciente.created_at)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Última atualização</label>
              <p className="text-gray-900">{formatDateTime(paciente.updated_at)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Email verificado</label>
              <p className="text-gray-900">
                {paciente.email_verified ? 'Sim' : 'Não'}
                {paciente.email_verified_at && ` (${formatDate(paciente.email_verified_at)})`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 