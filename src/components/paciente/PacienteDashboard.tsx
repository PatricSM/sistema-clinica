'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { createClient } from '@/utils/supabase/client'
import { MoodDiary } from './MoodDiary'
import PatientTasks from './PatientTasks'
import { MedicationManager } from './MedicationManager'
import { DocumentViewer } from './DocumentViewer'
import { PatientAppointments } from './PatientAppointments'
import { 
  Calendar, 
  FileText, 
  Heart, 
  ClipboardList,
  User,
  Clock,
  Download,
  MessageCircle,
  Pill,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface PacienteDashboardProps {
  paciente?: {
    nome: string
    proximaConsulta?: string
    medicoAtual?: string
  }
  metrics?: {
    proximasConsultas: number
    documentosPendentes: number
    questionariosPendentes: number
    medicamentosAtivos: number
    ultimoRegistroHumor: string
  }
}

export function PacienteDashboard({ paciente, metrics }: PacienteDashboardProps) {
  const { user, logout } = useCustomAuth()
const [currentView, setCurrentView] = useState<'dashboard' | 'diario' | 'consultas' | 'questionarios' | 'documentos' | 'tarefas' | 'medicamentos'>('dashboard')
  const [patientId, setPatientId] = useState<number | null>(null)
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
  
  // Dados de exemplo se não fornecidos
  const defaultPaciente = {
    nome: 'Maria Silva Santos',
    proximaConsulta: '2024-01-15 14:00',
    medicoAtual: 'Dr. João Santos'
  }

  const defaultMetrics = {
    proximasConsultas: 2,
    documentosPendentes: 1,
    questionariosPendentes: 3,
    medicamentosAtivos: 2,
    ultimoRegistroHumor: '2024-01-12'
  }

  const patientData = paciente || defaultPaciente
  const data = metrics || defaultMetrics

  const quickActions = [
    {
      title: 'Minhas Consultas',
      description: `${data.proximasConsultas} consultas agendadas`,
      icon: Calendar,
      action: () => setCurrentView('consultas'),
      color: 'bg-blue-500'
    },
    {
      title: 'Tarefas & Mensagens',
      description: 'Ver tarefas e mensagens do médico',
      icon: CheckCircle2,
      action: () => setCurrentView('tarefas'),
      color: 'bg-orange-500'
    },
    {
      title: 'Diário de Humor',
      description: 'Registrar como estou me sentindo',
      icon: Heart,
      action: () => setCurrentView('diario'),
      color: 'bg-pink-500'
    },
    {
      title: 'Questionários',
      description: `${data.questionariosPendentes} questionários pendentes`,
      icon: ClipboardList,
      action: () => setCurrentView('questionarios'),
      color: 'bg-purple-500'
    },
    {
      title: 'Gerenciar Medicamentos',
      description: 'Acompanhe suas medicações',
      icon: Pill,
      action: () => setCurrentView('medicamentos'),
      color: 'bg-green-500'
    },
    {
      title: 'Meus Documentos',
      description: `${data.documentosPendentes} documentos disponíveis`,
      icon: FileText,
      action: () => setCurrentView('documentos'),
      color: 'bg-indigo-500'
    }
  ]

  const proximasConsultas = [
    {
      data: '15/01/2024',
      horario: '14:00',
      medico: 'Dr. João Santos',
      tipo: 'Consulta de Retorno',
      status: 'confirmada',
      observacao: 'Revisão do tratamento'
    },
    {
      data: '22/01/2024',
      horario: '15:00',
      medico: 'Dr. João Santos',
      tipo: 'Sessão de Terapia',
      status: 'agendada',
      observacao: 'Terapia cognitivo-comportamental'
    }
  ]

  const medicamentosAtuais = [
    {
      nome: 'Sertralina 50mg',
      posologia: '1 comprimido ao dia',
      horario: '08:00',
      proximaTomada: 'Amanhã 08:00'
    },
    {
      nome: 'Rivotril 0,5mg',
      posologia: 'SOS conforme necessidade',
      horario: 'Conforme orientação',
      proximaTomada: 'Quando necessário'
    }
  ]

  const registrosHumor = [
    { data: '12/01', humor: 'Bem', cor: 'bg-green-400' },
    { data: '11/01', humor: 'Regular', cor: 'bg-yellow-400' },
    { data: '10/01', humor: 'Bem', cor: 'bg-green-400' },
    { data: '09/01', humor: 'Muito Bem', cor: 'bg-green-500' },
    { data: '08/01', humor: 'Regular', cor: 'bg-yellow-400' },
    { data: '07/01', humor: 'Ruim', cor: 'bg-red-400' },
    { data: '06/01', humor: 'Bem', cor: 'bg-green-400' }
  ]

  // Renderizar view específica
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
        <DocumentViewer />
      </div>
    )
  }

if (currentView === 'medicamentos') {
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
        <MedicationManager />
      </div>
    )
  }

if (currentView === 'consultas') {
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

        <PatientAppointments />
      </div>
    )
  }


if (currentView === 'diario') {
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
        
        <MoodDiary />
      </div>
    )
  }

  if (currentView === 'tarefas') {
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
        
        {patientId ? (
          <PatientTasks patientId={patientId} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    )
  }

  // View padrão do dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-400 rounded-full">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Olá, {patientData.nome}!</h1>
              <p className="text-teal-100">
                Sua área pessoal e acompanhamento
              </p>
              {patientData.proximaConsulta && (
                <p className="text-teal-100 mt-1">
                  Próxima consulta: {patientData.proximaConsulta} com {patientData.medicoAtual}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={logout}
            className="text-white border-white hover:bg-white hover:text-teal-600"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Informações importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Consultas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.proximasConsultas}</div>
            <p className="text-xs text-muted-foreground">
              Agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questionários</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.questionariosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.medicamentosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Em uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.documentosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className={`p-3 ${action.color} rounded-full text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 text-center">{action.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Seus agendamentos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasConsultas.map((consulta, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{consulta.data} às {consulta.horario}</div>
                      <div className="text-sm text-gray-600">{consulta.medico}</div>
                      <div className="text-sm text-gray-500">{consulta.tipo}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    consulta.status === 'confirmada' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {consulta.status === 'confirmada' ? 'Confirmada' : 'Agendada'}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentView('consultas')}>
              Ver todas as consultas
            </Button>
          </CardContent>
        </Card>

        {/* Registro de Humor */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Humor - Últimos 7 dias</CardTitle>
            <CardDescription>Como você tem se sentido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              {registrosHumor.map((registro, index) => (
                <div key={index} className="text-center">
                  <div className={`w-8 h-8 rounded-full ${registro.cor} mb-1`}></div>
                  <div className="text-xs text-gray-500">{registro.data}</div>
                  <div className="text-xs font-medium">{registro.humor}</div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentView('diario')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Registrar humor de hoje
            </Button>
          </CardContent>
        </Card>

        {/* Medicamentos atuais */}
        <Card>
          <CardHeader>
            <CardTitle>Medicamentos Atuais</CardTitle>
            <CardDescription>Suas medicações em uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicamentosAtuais.map((medicamento, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Pill className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{medicamento.nome}</div>
                      <div className="text-sm text-gray-600">{medicamento.posologia}</div>
                      <div className="text-sm text-gray-500">
                        Próxima: {medicamento.proximaTomada}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentView('medicamentos')}>
              <Pill className="mr-2 h-4 w-4" />
              Gerenciar medicamentos
            </Button>
          </CardContent>
        </Card>

        {/* Questionários pendentes */}
        <Card>
          <CardHeader>
            <CardTitle>Questionários Pendentes</CardTitle>
            <CardDescription>Escalas e avaliações para responder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Escala de Ansiedade (GAD-7)</div>
                    <div className="text-sm text-gray-600">Avaliação semanal</div>
                  </div>
                </div>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">PHQ-9 - Depressão</div>
                    <div className="text-sm text-gray-600">Questionário mensal</div>
                  </div>
                </div>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Qualidade do Sono</div>
                    <div className="text-sm text-gray-600">Avaliação semanal</div>
                  </div>
                </div>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentView('questionarios')}>
              Responder questionários
            </Button>
          </CardContent>
        </Card>

        {/* Documentos disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Disponíveis</CardTitle>
            <CardDescription>Seus relatórios, atestados e comprovantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 rounded-full">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Termo de Consentimento</div>
                    <div className="text-sm text-gray-600">Documento assinado</div>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 rounded-full">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Relatório Psicológico</div>
                    <div className="text-sm text-gray-600">Disponível para download</div>
                  </div>
                </div>
                <Download className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentView('documentos')}>
              <FileText className="mr-2 h-4 w-4" />
              Ver todos os documentos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 