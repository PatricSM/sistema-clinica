import { createClient } from '@supabase/supabase-js'
import type { 
  User, 
  Paciente, 
  Medico, 
  Secretaria, 
  Consulta, 
  Prontuario, 
  TransacaoFinanceira,
  Documento,
  TarefaPaciente,
  MedicamentoPaciente,
  DiarioHumor,
  QuestionarioTemplate,
  QuestionarioResposta,
  ConfiguracaoClinica,
  LogSistema,
  DashboardData,
  FiltrosBusca,
  PaginationResult
} from '@/types'

const supabaseUrl = 'https://swnwsxfqndhcezshrivv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bndzeGZxbmRoY2V6c2hyaXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjE0NjcsImV4cCI6MjA2NjYzNzQ2N30.k8NB4DFSDYpLtSFFR21C0wZLtEICCBxmqRiGdVAVoCg'

// Export the client for backward compatibility with existing code
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export individual functions for better tree-shaking and SSR compatibility
export const getSupabaseUrl = () => supabaseUrl
export const getSupabaseAnonKey = () => supabaseAnonKey

// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          full_name: string
          email: string
          password_hash: string
          phone: string | null
          address: string | null
          role: 'admin' | 'professional' | 'secretary' | 'patient'
          is_active: boolean
          avatar_url: string | null
          last_login: string | null
          email_verified: boolean
          email_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          full_name: string
          email: string
          password_hash: string
          phone?: string | null
          address?: string | null
          role: 'admin' | 'professional' | 'secretary' | 'patient'
          is_active?: boolean
          avatar_url?: string | null
          last_login?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          full_name?: string
          email?: string
          password_hash?: string
          phone?: string | null
          address?: string | null
          role?: 'admin' | 'professional' | 'secretary' | 'patient'
          is_active?: boolean
          avatar_url?: string | null
          last_login?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: number
          user_id: number
          date_of_birth: string | null
          gender: string | null
          cpf: string | null
          rg: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          responsible_id: number | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          date_of_birth?: string | null
          gender?: string | null
          cpf?: string | null
          rg?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          responsible_id?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          date_of_birth?: string | null
          gender?: string | null
          cpf?: string | null
          rg?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          responsible_id?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: number
          user_id: number
          crp_number: string
          specialty: string | null
          curriculum: string | null
          description: string | null
          consultation_price: number | null
          working_hours: any | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          crp_number: string
          specialty?: string | null
          curriculum?: string | null
          description?: string | null
          consultation_price?: number | null
          working_hours?: any | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          crp_number?: string
          specialty?: string | null
          curriculum?: string | null
          description?: string | null
          consultation_price?: number | null
          working_hours?: any | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      secretaries: {
        Row: {
          id: number
          user_id: number
          department?: string
          permissions?: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['secretaries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['secretaries']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: {
          id: number
          patient_id: number
          professional_id: number
          start_time: string
          end_time: string
          status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          patient_id: number
          professional_id: number
          start_time: string
          end_time: string
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          patient_id?: number
          professional_id?: number
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: Omit<Prontuario, 'diagnoses'>
        Insert: Omit<Prontuario, 'id' | 'created_at' | 'updated_at' | 'diagnoses'>
        Update: Partial<Omit<Prontuario, 'id' | 'created_at' | 'updated_at' | 'diagnoses'>>
      }
      financial_transactions: {
        Row: Omit<TransacaoFinanceira, 'patient' | 'professional'>
        Insert: Omit<TransacaoFinanceira, 'id' | 'created_at' | 'updated_at' | 'patient' | 'professional'>
        Update: Partial<Omit<TransacaoFinanceira, 'id' | 'created_at' | 'updated_at' | 'patient' | 'professional'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: 'admin' | 'professional' | 'secretary' | 'patient'
      appointment_status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'boleto'
      transaction_type: 'receipt' | 'invoice' | 'payment'
      document_type: 'consent_form' | 'report' | 'attestation' | 'receipt' | 'contract' | 'medical_record_summary' | 'other'
      task_type: 'task' | 'message' | 'scale' | 'questionnaire'
    }
  }
}

export type UserRole = Database['public']['Enums']['user_role']
export type AppointmentStatus = Database['public']['Enums']['appointment_status']

// Helper Functions for Database Operations

// Usuários
export const getUsers = async (filters?: FiltrosBusca): Promise<PaginationResult<User>> => {
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
    has_next: (count || 0) > to + 1,
    has_prev: page > 1
  }
}

// Pacientes com dados relacionados
export const getPacientes = async (filters?: FiltrosBusca): Promise<PaginationResult<Paciente>> => {
  let query = supabase
    .from('users')
    .select(`
      *,
      patient_data:patients(*)
    `, { count: 'exact' })
    .eq('role', 'patient')

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error

  // Transform data to match Paciente interface
  const pacientes: Paciente[] = (data || []).map(user => ({
    ...user,
    patient_data: user.patient_data?.[0] || {
      id: 0,
      status: 'active'
    }
  }))

  return {
    data: pacientes,
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
    has_next: (count || 0) > to + 1,
    has_prev: page > 1
  }
}

// Médicos com dados relacionados
export const getMedicos = async (filters?: FiltrosBusca): Promise<PaginationResult<Medico>> => {
  let query = supabase
    .from('users')
    .select(`
      *,
      professional_data:professionals(*)
    `, { count: 'exact' })
    .eq('role', 'professional')

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error

  // Transform data to match Medico interface
  const medicos: Medico[] = (data || []).map(user => ({
    ...user,
    professional_data: user.professional_data?.[0] || {
      id: 0,
      crp_number: '',
      is_available: true
    }
  }))

  return {
    data: medicos,
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
    has_next: (count || 0) > to + 1,
    has_prev: page > 1
  }
}

// Consultas com dados relacionados
export const getConsultas = async (filters?: FiltrosBusca): Promise<PaginationResult<Consulta>> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients!inner(
        id,
        user:users!inner(full_name, phone)
      ),
      professional:professionals!inner(
        id,
        user:users!inner(full_name),
        specialty
      )
    `, { count: 'exact' })

  if (filters?.professional_id) {
    query = query.eq('professional_id', filters.professional_id)
  }

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id)
  }

  if (filters?.date_from) {
    query = query.gte('start_time', filters.date_from)
  }

  if (filters?.date_to) {
    query = query.lte('start_time', filters.date_to)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error

  // Transform data to match Consulta interface
  const consultas: Consulta[] = (data || []).map(appointment => ({
    ...appointment,
    patient: {
      full_name: appointment.patient?.user?.full_name || '',
      phone: appointment.patient?.user?.phone
    },
    professional: {
      full_name: appointment.professional?.user?.full_name || '',
      specialty: appointment.professional?.specialty
    }
  }))

  return {
    data: consultas,
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
    has_next: (count || 0) > to + 1,
    has_prev: page > 1
  }
}

// Dashboard Data
export const getDashboardData = async (): Promise<DashboardData> => {
  const today = new Date().toISOString().split('T')[0]
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date()
  startOfMonth.setDate(1)

  // Get counts
  const [
    { count: totalPatients },
    { count: totalProfessionals },
    { count: totalAppointments },
    { count: appointmentsToday },
    { count: appointmentsThisWeek },
    { count: appointmentsThisMonth },
    { count: activePatients }
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', today).lt('start_time', `${today}T23:59:59`),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', startOfWeek.toISOString()),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', startOfMonth.toISOString()),
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('status', 'active')
  ])

  // Get recent appointments
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients!inner(user:users!inner(full_name, phone)),
      professional:professionals!inner(user:users!inner(full_name), specialty)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients!inner(user:users!inner(full_name, phone)),
      professional:professionals!inner(user:users!inner(full_name), specialty)
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  // Calculate revenue this month (mock for now)
  const revenueThisMonth = (appointmentsThisMonth || 0) * 150 // Average price

  return {
    total_patients: totalPatients || 0,
    total_professionals: totalProfessionals || 0,
    total_appointments: totalAppointments || 0,
    appointments_today: appointmentsToday || 0,
    appointments_this_week: appointmentsThisWeek || 0,
    appointments_this_month: appointmentsThisMonth || 0,
    revenue_this_month: revenueThisMonth,
    active_patients: activePatients || 0,
    recent_appointments: (recentAppointments || []).map(app => ({
      ...app,
      patient: {
        full_name: app.patient?.user?.full_name || '',
        phone: app.patient?.user?.phone
      },
      professional: {
        full_name: app.professional?.user?.full_name || '',
        specialty: app.professional?.specialty
      }
    })),
    upcoming_appointments: (upcomingAppointments || []).map(app => ({
      ...app,
      patient: {
        full_name: app.patient?.user?.full_name || '',
        phone: app.patient?.user?.phone
      },
      professional: {
        full_name: app.professional?.user?.full_name || '',
        specialty: app.professional?.specialty
      }
    })),
    pending_confirmations: Math.floor((appointmentsToday || 0) * 0.3), // Mock
    no_show_rate: 0.15 // Mock 15%
  }
}

// Mock data para desenvolvimento (remover quando conectar ao banco real)
export const mockUsers = {
  admin: {
    id: 1,
    full_name: 'Dr. João Silva',
    email: 'admin@clinica.com',
    phone: '(11) 99999-9999',
    role: 'admin' as const,
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  professional: {
    id: 2,
    full_name: 'Dra. Maria Santos',
    email: 'maria@clinica.com',
    phone: '(11) 98888-8888',
    role: 'professional' as const,
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    professional_data: {
      id: 1,
      crp_number: 'CRP 06/12345',
      specialty: 'Psicologia Clínica',
      consultation_price: 200,
      is_available: true
    }
  },
  secretary: {
    id: 3,
    full_name: 'Ana Costa',
    email: 'ana@clinica.com',
    phone: '(11) 97777-7777',
    role: 'secretary' as const,
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    secretary_data: {
      id: 1,
      department: 'Recepção'
    }
  },
  patient: {
    id: 4,
    full_name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    phone: '(11) 96666-6666',
    role: 'patient' as const,
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    patient_data: {
      id: 1,
      date_of_birth: '1990-05-15',
      cpf: '123.456.789-00',
      status: 'active' as const
    }
  }
} 