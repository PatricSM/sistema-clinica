// Tipos de usuário do sistema (alinhado com user_role ENUM)
export type UserRole = 'admin' | 'professional' | 'secretary' | 'patient'

// Interface base do usuário (alinhada com tabela users)
export interface User {
  id: number
  full_name: string
  email: string
  phone?: string
  address?: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  last_login?: string
  email_verified: boolean
  email_verified_at?: string
  created_at: string
  updated_at: string
}

// Interface do Administrador
export interface Administrador extends User {
  role: 'admin'
  permissoes_especiais?: string[]
}

// Interface do Médico/Psicólogo (alinhada com tabela professionals)
export interface Medico extends User {
  role: 'professional'
  professional_data: {
    id: number
    crp_number: string
    specialty?: string
    curriculum?: string
    description?: string
    consultation_price?: number
    working_hours?: {
      monday?: string
      tuesday?: string
      wednesday?: string
      thursday?: string
      friday?: string
      saturday?: string
      sunday?: string
    }
    is_available: boolean
  }
}

// Interface da Secretária (alinhada com tabela secretaries)
export interface Secretaria extends User {
  role: 'secretary'
  secretary_data: {
    id: number
    department?: string
    permissions?: Record<string, boolean>
  }
}

// Interface do Paciente (alinhada com tabela patients)
export interface Paciente extends User {
  role: 'patient'
  patient_data: {
    id: number
    date_of_birth?: string
    gender?: string
    cpf?: string
    rg?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    responsible_id?: number
    status: 'active' | 'inactive' | 'suspended'
  }
}

// Status de agendamento (alinhado com appointment_status ENUM)
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

// Interface para Consultas/Agendamentos (alinhada com tabela appointments)
export interface Consulta {
  id: number
  patient_id: number
  professional_id: number
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  // Dados relacionados (joins)
  patient?: {
    full_name: string
    phone?: string
  }
  professional?: {
    full_name: string
    specialty?: string
  }
}

// Interface para Prontuário (alinhada com tabela medical_records)
export interface Prontuario {
  id: number
  patient_id: number
  professional_id: number
  record_date: string
  session_notes?: string
  observations?: string
  created_at: string
  updated_at: string
  // Diagnósticos relacionados
  diagnoses?: Diagnosis[]
}

// Interface para Diagnósticos (alinhada com tabela diagnoses)
export interface Diagnosis {
  id: number
  code: string
  description: string
  type: 'CID-10' | 'DSM-5'
  created_at: string
  updated_at: string
}

// Tipos de documento (alinhado com document_type ENUM)
export type DocumentType = 'consent_form' | 'report' | 'attestation' | 'receipt' | 'contract' | 'medical_record_summary' | 'other'

// Interface para Documentos (alinhada com tabela documents)
export interface Documento {
  id: number
  patient_id?: number
  professional_id?: number
  document_type: DocumentType
  title: string
  file_url?: string
  signed_by_patient: boolean
  signed_date?: string
  created_at: string
  updated_at: string
}

// Métodos de pagamento (alinhado com payment_method ENUM)
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'boleto'

// Tipos de transação (alinhado com transaction_type ENUM)
export type TransactionType = 'receipt' | 'invoice' | 'payment'

// Interface para Transações Financeiras (alinhada com tabela financial_transactions)
export interface TransacaoFinanceira {
  id: number
  patient_id: number
  professional_id?: number
  amount: number
  transaction_date: string
  payment_method: PaymentMethod
  transaction_type: TransactionType
  status: string
  notes?: string
  created_at: string
  updated_at: string
  // Dados relacionados
  patient?: {
    full_name: string
  }
  professional?: {
    full_name: string
  }
}

// Interface para Questionários (alinhada com tabela questionnaire_templates)
export interface QuestionarioTemplate {
  id: number
  name: string
  description?: string
  questions_json?: Record<string, any>
  created_at: string
  updated_at: string
}

// Interface para Respostas de Questionários (alinhada com tabela patient_questionnaires)
export interface QuestionarioResposta {
  id: number
  patient_id: number
  questionnaire_template_id: number
  completion_date: string
  answers_json?: Record<string, any>
  created_at: string
  updated_at: string
  // Dados relacionados
  template?: QuestionarioTemplate
  patient?: {
    full_name: string
  }
}

// Tipos de tarefa (alinhado com task_type ENUM)
export type TaskType = 'task' | 'message' | 'scale' | 'questionnaire'

// Interface para Tarefas do Paciente (alinhada com tabela patient_tasks)
export interface TarefaPaciente {
  id: number
  patient_id: number
  professional_id: number
  task_type: TaskType
  title: string
  description: string
  due_date?: string
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
  // Dados relacionados
  patient?: {
    full_name: string
  }
  professional?: {
    full_name: string
  }
}

// Interface para Medicamentos do Paciente (alinhada com tabela patient_medications)
export interface MedicamentoPaciente {
  id: number
  patient_id: number
  medication_name: string
  dosage?: string
  frequency?: string
  start_date: string
  end_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Interface para Diário de Humor (alinhada com tabela patient_mood_diary)
export interface DiarioHumor {
  id: number
  patient_id: number
  diary_date: string
  mood_rating?: number
  notes?: string
  created_at: string
  updated_at: string
}

// Interface para Configurações da Clínica (alinhada com tabela clinic_settings)
export interface ConfiguracaoClinica {
  id: number
  setting_key: string
  setting_value?: string
  description?: string
  created_at: string
  updated_at: string
}

// Interface para Logs do Sistema (alinhada com tabela logs)
export interface LogSistema {
  id: number
  user_id?: number
  action: string
  timestamp: string
  ip_address?: string
  details_json?: Record<string, any>
  created_at: string
  // Dados relacionados
  user?: {
    full_name: string
    email: string
  }
}

// Interface para Analytics e Dashboard
export interface DashboardData {
  total_patients: number
  total_professionals: number
  total_appointments: number
  appointments_today: number
  appointments_this_week: number
  appointments_this_month: number
  revenue_this_month: number
  active_patients: number
  recent_appointments: Consulta[]
  upcoming_appointments: Consulta[]
  pending_confirmations: number
  no_show_rate: number
}

// Interface para Relatórios
export interface RelatorioFinanceiro {
  period_start: string
  period_end: string
  total_revenue: number
  total_appointments: number
  appointments_by_professional: Record<string, number>
  revenue_by_professional: Record<string, number>
  payment_methods: Record<PaymentMethod, number>
  monthly_comparison: {
    current_month: number
    previous_month: number
    growth_rate: number
  }
}

// Interface para filtros de busca
export interface FiltrosBusca {
  search?: string
  role?: UserRole
  status?: string
  date_from?: string
  date_to?: string
  professional_id?: number
  patient_id?: number
  page?: number
  limit?: number
}

// Interface para paginação
export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
} 