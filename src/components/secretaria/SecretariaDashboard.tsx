'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { PendingAppointments } from '@/components/admin/PendingAppointments'
import { AgendaGestao } from './AgendaGestao'
import { PacientesGestao } from './PacientesGestao'
import { DocumentosGestao } from './DocumentosGestao'
import type { User } from '@/types'
import { 
  Users, 
  Calendar, 
  Phone, 
  FileText,
  UserPlus,
  CalendarCheck,
  MessageSquare,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface SecretariaDashboardProps {
  metrics?: {
    agendamentosHoje: number
    pacientesCadastrados: number
    confirmacoesPendentes: number
    ligacoesPendentes: number
    novosCadastros: number
    reagendamentos: number
  }
}

export function SecretariaDashboard({ metrics }: SecretariaDashboardProps) {
  const { logout } = useCustomAuth()
  const [currentView, setCurrentView] = useState<'dashboard' | 'confirmacoes' | 'agenda' | 'pacientes' | 'documentos'>('dashboard')
  
  // Dados de exemplo se não fornecidos
  const defaultMetrics = {
    agendamentosHoje: 32,
    pacientesCadastrados: 245,
    confirmacoesPendentes: 8,
    ligacoesPendentes: 5,
    novosCadastros: 3,
    reagendamentos: 2
  }

  const data = metrics || defaultMetrics

  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente no sistema',
      icon: UserPlus,
      action: () => setCurrentView('pacientes'),
      color: 'bg-blue-500'
    },
    {
      title: 'Agendar Consulta',
      description: 'Marcar nova consulta para paciente',
      icon: CalendarCheck,
      action: () => setCurrentView('agenda'),
      color: 'bg-green-500'
    },
    {
      title: 'Confirmações',
      description: `${data.confirmacoesPendentes} confirmações pendentes`,
      icon: Phone,
      action: () => setCurrentView('confirmacoes'),
      color: 'bg-orange-500'
    },
    {
      title: 'Documentos',
      description: 'Enviar recibos e documentos',
      icon: FileText,
      action: () => setCurrentView('documentos'),
      color: 'bg-purple-500'
    }
  ]

  const agendaHoje = [
    {
      horario: '08:00',
      medico: 'Dr. João Santos',
      paciente: 'Ana Maria Costa',
      status: 'confirmado',
      tipo: 'Consulta'
    },
    {
      horario: '09:00',
      medico: 'Dra. Maria Lima',
      paciente: 'Pedro Silva',
      status: 'pendente',
      tipo: 'Retorno'
    },
    {
      horario: '10:00',
      medico: 'Dr. João Santos',
      paciente: 'Lucia Santos',
      status: 'confirmado',
      tipo: 'Avaliação'
    },
    {
      horario: '14:00',
      medico: 'Dr. Carlos Mendes',
      paciente: 'Roberto Lima',
      status: 'reagendar',
      tipo: 'Consulta'
    },
    {
      horario: '15:00',
      medico: 'Dra. Maria Lima',
      paciente: 'Julia Oliveira',
      status: 'confirmado',
      tipo: 'Retorno'
    }
  ]

  const tarefasPendentes = [
    {
      tipo: 'ligacao',
      descricao: 'Confirmar consulta Ana Maria',
      prioridade: 'alta',
      prazo: '30 min'
    },
    {
      tipo: 'documento',
      descricao: 'Enviar recibo Pedro Silva',
      prioridade: 'media',
      prazo: '2 horas'
    },
    {
      tipo: 'reagendamento',
      descricao: 'Reagendar Roberto Lima',
      prioridade: 'alta',
      prazo: '1 hora'
    },
    {
      tipo: 'cadastro',
      descricao: 'Completar dados Carlos Santos',
      prioridade: 'baixa',
      prazo: 'Amanhã'
    }
  ]

  // Renderizar views específicas
  if (currentView === 'confirmacoes') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        <PendingAppointments />
      </div>
    )
  }

  if (currentView === 'agenda') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        <AgendaGestao />
      </div>
    )
  }

  if (currentView === 'pacientes') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        <PacientesGestao />
      </div>
    )
  }

  if (currentView === 'documentos') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        <DocumentosGestao />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-400 rounded-full">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Central da Secretaria</h1>
              <p className="text-pink-100">
                Gestão de agenda e atendimento aos pacientes
              </p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={logout}
            className="text-white border-white hover:bg-white hover:text-pink-600"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">
              {data.reagendamentos} reagendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pacientesCadastrados}</div>
            <p className="text-xs text-muted-foreground">
              +{data.novosCadastros} novos esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmações Pendentes</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.confirmacoesPendentes}</div>
            <p className="text-xs text-muted-foreground">
              {data.ligacoesPendentes} ligações a fazer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas do Dia</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasPendentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes para hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={action.action}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Agenda de hoje e tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda de Hoje</CardTitle>
            <CardDescription>Todos os agendamentos do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendaHoje.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-blue-600 min-w-[50px]">
                      {item.horario}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.paciente}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.medico} • {item.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'confirmado' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'confirmado' ? 'Confirmado' : 
                       item.status === 'pendente' ? 'Pendente' : 'Reagendar'}
                    </span>
                    {item.status === 'pendente' && (
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setCurrentView('agenda')}
            >
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>Ações prioritárias para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tarefasPendentes.map((tarefa, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      tarefa.tipo === 'ligacao' ? 'bg-blue-100' :
                      tarefa.tipo === 'documento' ? 'bg-purple-100' :
                      tarefa.tipo === 'reagendamento' ? 'bg-red-100' :
                      'bg-green-100'
                    }`}>
                      {tarefa.tipo === 'ligacao' && <Phone className="h-4 w-4 text-blue-600" />}
                      {tarefa.tipo === 'documento' && <FileText className="h-4 w-4 text-purple-600" />}
                      {tarefa.tipo === 'reagendamento' && <Calendar className="h-4 w-4 text-red-600" />}
                      {tarefa.tipo === 'cadastro' && <UserPlus className="h-4 w-4 text-green-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tarefa.descricao}
                      </p>
                      <p className="text-xs text-gray-500">
                        Prazo: {tarefa.prazo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      tarefa.prioridade === 'alta' 
                        ? 'bg-red-100 text-red-800'
                        : tarefa.prioridade === 'media'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {tarefa.prioridade === 'alta' ? 'Alta' : 
                       tarefa.prioridade === 'media' ? 'Média' : 'Baixa'}
                    </span>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setCurrentView('confirmacoes')}
            >
              Ver todas as tarefas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 