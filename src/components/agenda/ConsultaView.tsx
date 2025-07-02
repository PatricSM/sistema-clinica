'use client'

import { useState } from 'react'
import { 
  Clock,
  User,
  Stethoscope,
  Calendar,
  FileText,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Phone,
  MapPin,
  MessageSquare,
  History,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Consulta } from '@/types'

interface ConsultaViewProps {
  consulta: Consulta & {
    patient_name?: string
    professional_name?: string
    duration?: number
  }
  onEdit?: () => void
  onDelete?: () => void
  onBack?: () => void
  onStatusChange?: (newStatus: string) => void
  className?: string
}

// Mock data adicional para demonstração
const mockPacienteDetalhes = {
  1: { 
    name: 'Ana Silva Costa', 
    phone: '(11) 98765-4321', 
    email: 'ana.silva@email.com',
    address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
    lastSession: '2024-12-15',
    totalSessions: 8,
    emergencyContact: 'João Silva - (11) 99876-5432'
  },
  2: { 
    name: 'Carlos Eduardo Santos', 
    phone: '(11) 97654-3210', 
    email: 'carlos.eduardo@email.com',
    address: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
    lastSession: '2024-12-20',
    totalSessions: 12,
    emergencyContact: 'Maria Santos - (11) 98765-4321'
  },
  3: { 
    name: 'Mariana Oliveira Lima', 
    phone: '(11) 96543-2109', 
    email: 'mariana.oliveira@email.com',
    address: 'Rua Augusta, 789 - Consolação, São Paulo - SP',
    lastSession: '2024-12-22',
    totalSessions: 15,
    emergencyContact: 'Pedro Lima - (11) 97654-3210'
  },
  4: { 
    name: 'Roberto Ferreira Souza', 
    phone: '(11) 95432-1098', 
    email: 'roberto.ferreira@email.com',
    address: 'Rua Haddock Lobo, 321 - Jardins, São Paulo - SP',
    lastSession: '2024-12-10',
    totalSessions: 6,
    emergencyContact: 'Ana Souza - (11) 96543-2109'
  }
}

const mockProfissionaisDetalhes = {
  2: { 
    name: 'Dra. Maria Santos', 
    specialty: 'Psicologia Clínica', 
    crp: 'CRP 06/123456',
    phone: '(11) 3456-7890',
    email: 'maria.santos@clinica.com'
  },
  3: { 
    name: 'Dr. João Costa', 
    specialty: 'Neuropsicologia', 
    crp: 'CRP 06/234567',
    phone: '(11) 3456-7891',
    email: 'joao.costa@clinica.com'
  },
  4: { 
    name: 'Dra. Ana Rodrigues', 
    specialty: 'Psicologia Infantil', 
    crp: 'CRP 06/345678',
    phone: '(11) 3456-7892',
    email: 'ana.rodrigues@clinica.com'
  }
}

export function ConsultaView({ 
  consulta, 
  onEdit, 
  onDelete, 
  onBack, 
  onStatusChange,
  className 
}: ConsultaViewProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Obter detalhes adicionais
  const pacienteDetalhes = mockPacienteDetalhes[consulta.patient_id as keyof typeof mockPacienteDetalhes]
  const profissionalDetalhes = mockProfissionaisDetalhes[consulta.professional_id as keyof typeof mockProfissionaisDetalhes]

  // Funções utilitárias
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      scheduled: { 
        label: 'Agendada', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        canEdit: true,
        nextActions: ['confirmed', 'cancelled']
      },
      confirmed: { 
        label: 'Confirmada', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Check,
        canEdit: true,
        nextActions: ['completed', 'no_show', 'cancelled']
      },
      completed: { 
        label: 'Realizada', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Check,
        canEdit: false,
        nextActions: []
      },
      cancelled: { 
        label: 'Cancelada', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        canEdit: true,
        nextActions: ['scheduled']
      },
      no_show: { 
        label: 'Faltou', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        canEdit: true,
        nextActions: ['scheduled']
      }
    }
    return statusConfig[status as keyof typeof statusConfig]
  }

  const getDuration = () => {
    if (consulta.duration) return consulta.duration
    
    const start = new Date(consulta.start_time)
    const end = new Date(consulta.end_time)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDelete?.()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Erro ao deletar consulta:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const startTime = formatDateTime(consulta.start_time)
  const endTime = formatDateTime(consulta.end_time)
  const statusInfo = getStatusInfo(consulta.status)
  const StatusIcon = statusInfo?.icon || Clock
  const duration = getDuration()

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consulta - {startTime.date}
            </h1>
            <p className="text-gray-600">
              {startTime.time} às {endTime.time} ({duration} minutos)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusInfo?.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{statusInfo?.label}</span>
          </div>
          
          {statusInfo?.canEdit && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - Informações da consulta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Detalhes da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <p className="text-lg font-semibold">{startTime.date}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Horário</label>
                  <p className="text-lg font-semibold">{startTime.time} - {endTime.time}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Duração</label>
                  <p className="text-lg font-semibold">{duration} minutos</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className={`inline-flex px-2 py-1 rounded-full text-sm ${statusInfo?.color} mt-1`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusInfo?.label}
                  </div>
                </div>
              </div>

              {consulta.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-900">{consulta.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações rápidas de status */}
          {statusInfo?.nextActions && statusInfo.nextActions.length > 0 && onStatusChange && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Altere o status da consulta rapidamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {statusInfo.nextActions.map(action => {
                    const actionInfo = getStatusInfo(action)
                    const ActionIcon = actionInfo?.icon || Clock
                    
                    return (
                      <Button
                        key={action}
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(action)}
                        className="flex items-center space-x-1"
                      >
                        <ActionIcon className="w-4 h-4" />
                        <span>Marcar como {actionInfo?.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de alterações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Consulta agendada</p>
                    <p className="text-xs text-gray-500">
                      {new Date(consulta.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {consulta.updated_at !== consulta.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Última atualização</p>
                      <p className="text-xs text-gray-500">
                        {new Date(consulta.updated_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informações do paciente e profissional */}
        <div className="space-y-6">
          {/* Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pacienteDetalhes ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{pacienteDetalhes.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{pacienteDetalhes.phone}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-600">{pacienteDetalhes.address}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-500">Total de sessões</label>
                        <p className="font-semibold">{pacienteDetalhes.totalSessions}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Última sessão</label>
                        <p className="font-semibold">
                          {new Date(pacienteDetalhes.lastSession).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs text-gray-500">Contato de emergência</label>
                    <p className="text-sm">{pacienteDetalhes.emergencyContact}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Informações do paciente não disponíveis</p>
              )}
            </CardContent>
          </Card>

          {/* Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profissionalDetalhes ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{profissionalDetalhes.name}</h3>
                    <p className="text-gray-600">{profissionalDetalhes.specialty}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <label className="text-gray-500">CRP</label>
                      <p className="font-medium">{profissionalDetalhes.crp}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{profissionalDetalhes.phone}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Informações do profissional não disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
                <p className="text-gray-600">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir esta consulta de <strong>{startTime.date}</strong> às <strong>{startTime.time}</strong>?
            </p>
            
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Consulta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 