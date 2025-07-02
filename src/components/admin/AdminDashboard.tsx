'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  UserCheck,
  Building,
  FileText,
  UserPlus,
  Home,
  CreditCard,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import type { DashboardData, Consulta, User, TransacaoFinanceira } from '@/types'
import { PacientesManager } from './PacientesManager'
import { AgendaManager } from '../agenda/AgendaManager'
import { UsersManager } from './UsersManager'
import FinancialDashboard from './FinancialDashboard'
import { PendingAppointments } from './PendingAppointments'
import AnalyticsAdvanced from './AnalyticsAdvanced'
import AdvancedAgendaManager from '../agenda/AdvancedAgendaManager'

type AdminView = 'dashboard' | 'pacientes' | 'agenda' | 'agenda-avancada' | 'usuarios' | 'financeiro' | 'consultas' | 'analytics'

// Interface para appointments com joins do Supabase
interface AppointmentWithJoins {
  id: number
  patient_id: number
  professional_id: number
  start_time: string
  end_time: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  patient?: {
    user?: {
      full_name?: string
      phone?: string
    }
  }
  professional?: {
    user?: {
      full_name?: string
    }
  }
}

export function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useCustomAuth()
  const supabase = createClient()

  // Carregar dados reais do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Buscar estatísticas básicas
        const [
          { count: totalPatients },
          { count: totalProfessionals },
          { count: totalAppointments },
          { data: appointments },
          { data: recentUsers },
          { data: financialData }
        ] = await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          supabase.from('professionals').select('id', { count: 'exact', head: true }),
          supabase.from('appointments').select('id', { count: 'exact', head: true }),
          supabase
            .from('appointments')
            .select(`
              *,
              patient:patients!inner(user:users!inner(full_name, phone)),
              professional:professionals!inner(user:users!inner(full_name))
            `)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('financial_transactions')
            .select('amount, created_at')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ])

        // Calcular estatísticas
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()))
        const thisWeekStr = thisWeekStart.toISOString().split('T')[0]

        const appointmentsToday = appointments?.filter((app: AppointmentWithJoins) => 
          app.start_time.startsWith(todayStr)
        ).length || 0

        const appointmentsThisWeek = appointments?.filter((app: AppointmentWithJoins) => 
          app.start_time >= thisWeekStr
        ).length || 0

        const revenueThisMonth = financialData?.reduce((sum: number, transaction: TransacaoFinanceira) => 
          sum + Number(transaction.amount), 0
        ) || 0

        const activePatients = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'patient')
          .eq('is_active', true)

        const pendingConfirmations = appointments?.filter((app: AppointmentWithJoins) => 
          app.status === 'scheduled'
        ).length || 0

        const completedAppointments = appointments?.filter((app: AppointmentWithJoins) => 
          app.status === 'completed'
        ).length || 0

        const noShowAppointments = appointments?.filter((app: AppointmentWithJoins) => 
          app.status === 'no_show'
        ).length || 0

        const noShowRate = completedAppointments > 0 
          ? noShowAppointments / (completedAppointments + noShowAppointments)
          : 0

        // Formatar dados para o dashboard
        const dashboardData: DashboardData = {
          total_patients: totalPatients || 0,
          total_professionals: totalProfessionals || 0,
          total_appointments: totalAppointments || 0,
          appointments_today: appointmentsToday,
          appointments_this_week: appointmentsThisWeek,
          appointments_this_month: appointments?.length || 0,
          revenue_this_month: revenueThisMonth,
          active_patients: activePatients.count || 0,
          pending_confirmations: pendingConfirmations,
          no_show_rate: noShowRate,
          recent_appointments: appointments?.slice(0, 5).map((app: AppointmentWithJoins): Consulta => ({
            id: app.id,
            patient_id: app.patient_id,
            professional_id: app.professional_id,
            start_time: app.start_time,
            end_time: app.end_time,
            status: app.status as any,
            notes: app.notes,
            created_at: app.created_at,
            updated_at: app.updated_at,
            patient: {
              full_name: app.patient?.user?.full_name || 'N/A',
              phone: app.patient?.user?.phone || 'N/A'
            },
            professional: {
              full_name: app.professional?.user?.full_name || 'N/A',
              specialty: 'Psicologia'
            }
          })) || [],
          upcoming_appointments: appointments?.filter((app: AppointmentWithJoins) => 
            new Date(app.start_time) > new Date() && app.status !== 'cancelled'
          ).slice(0, 3).map((app: AppointmentWithJoins): Consulta => ({
            id: app.id,
            patient_id: app.patient_id,
            professional_id: app.professional_id,
            start_time: app.start_time,
            end_time: app.end_time,
            status: app.status as any,
            notes: app.notes,
            created_at: app.created_at,
            updated_at: app.updated_at,
            patient: {
              full_name: app.patient?.user?.full_name || 'N/A',
              phone: app.patient?.user?.phone || 'N/A'
            },
            professional: {
              full_name: app.professional?.user?.full_name || 'N/A',
              specialty: 'Psicologia'
            }
          })) || []
        }

        setDashboardData(dashboardData)
        setRecentUsers(recentUsers || [])
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user, supabase])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendada',
      confirmed: 'Confirmada',
      completed: 'Realizada',
      cancelled: 'Cancelada',
      no_show: 'Faltou'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Renderização condicional baseada na visualização atual
  if (currentView === 'pacientes') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <PacientesManager />
      </div>
    )
  }

  if (currentView === 'agenda') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="mb-4"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button 
              onClick={() => setCurrentView('agenda-avancada')}
              className="mb-4"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agenda Avançada
            </Button>
          </div>
        </div>
        <AgendaManager />
      </div>
    )
  }

  if (currentView === 'agenda-avancada') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="mb-4"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentView('agenda')}
              className="mb-4"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agenda Simples
            </Button>
          </div>
        </div>
        <AdvancedAgendaManager />
      </div>
    )
  }

  if (currentView === 'usuarios') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <UsersManager />
      </div>
    )
  }

  if (currentView === 'financeiro') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <FinancialDashboard />
      </div>
    )
  }

  if (currentView === 'analytics') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <AnalyticsAdvanced />
      </div>
    )
  }

  if (currentView === 'consultas') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <PendingAppointments />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral do sistema da clínica</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_patients}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.active_patients} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_professionals}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.total_professionals - 1} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.appointments_this_month}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((dashboardData.appointments_this_month / dashboardData.total_appointments) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.revenue_this_month)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardData.appointments_today}</div>
            <p className="text-xs text-muted-foreground">consultas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmações Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{dashboardData.pending_confirmations}</div>
            <p className="text-xs text-muted-foreground">necessitam confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ausência</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{Math.round(dashboardData.no_show_rate * 100)}%</div>
            <p className="text-xs text-muted-foreground">últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Listas de Atividades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consultas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Recentes</CardTitle>
            <CardDescription>Últimas consultas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recent_appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{appointment.patient?.full_name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.professional?.full_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(appointment.start_time)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Agendamentos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcoming_appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{appointment.patient?.full_name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.professional?.full_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(appointment.start_time)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </div>
              ))}

              {/* Usuários Recentes */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Novos Usuários</h4>
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.role === 'patient' ? 'Paciente' : 'Profissional'}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Tarefas administrativas comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Novo Usuário
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Ver Agenda
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Gerar Relatório
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Building className="h-6 w-6 mb-2" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 