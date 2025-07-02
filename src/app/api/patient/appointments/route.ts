import { NextRequest, NextResponse } from 'next/server'
import { validateAuthToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação usando sistema customizado
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await validateAuthToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar patient_id do usuário
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (patientError || !patientData) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    // Buscar consultas do paciente com dados do profissional
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        professional_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        professional:professionals!appointments_professional_id_fkey(
          user:users!professionals_user_id_fkey(
            full_name,
            email
          ),
          specialty,
          crp_number
        )
      `)
      .eq('patient_id', patientData.id)
      .order('start_time', { ascending: false })

    if (appointmentsError) {
      console.error('Erro ao buscar consultas:', appointmentsError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({ 
      appointments: appointments || []
    })

  } catch (error) {
    console.error('💥 Erro interno completo:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando POST /api/patient/appointments')
    
    // Verificar autenticação usando sistema customizado
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      console.log('❌ Token não encontrado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await validateAuthToken(token)
    
    if (!user) {
      console.log('❌ Token inválido')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (user.role !== 'patient') {
      console.log('❌ Usuário não é paciente:', user.role)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar patient_id do usuário
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (patientError || !patientData) {
      console.log('❌ Paciente não encontrado para user_id:', user.id)
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { professional_id, start_time, end_time, notes } = body

    // Validações básicas
    if (!professional_id || !start_time || !end_time) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: professional_id, start_time, end_time' 
      }, { status: 400 })
    }

    // Verificar se o profissional existe
    const { data: professionalExists, error: profError } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', professional_id)
      .single()

    if (profError || !professionalExists) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
    }

    // Verificar se não há conflito de horário para o profissional
    const { data: conflictCheck, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', professional_id)
      .in('status', ['scheduled', 'confirmed'])
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`)

    if (conflictError) {
      console.error('Erro ao verificar conflitos:', conflictError)
      return NextResponse.json({ error: 'Erro ao verificar disponibilidade' }, { status: 500 })
    }

    if (conflictCheck && conflictCheck.length > 0) {
      return NextResponse.json({ 
        error: 'Horário não disponível. Já existe uma consulta marcada para esse período.' 
      }, { status: 409 })
    }

    // Criar nova consulta com status 'scheduled' (pendente)
    const { data: newAppointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientData.id,
        professional_id,
        start_time,
        end_time,
        status: 'scheduled', // Status inicial para consultas solicitadas pelo paciente
        notes: notes || null
      })
      .select(`
        id,
        patient_id,
        professional_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        professional:professionals!appointments_professional_id_fkey(
          user:users!professionals_user_id_fkey(
            full_name,
            email
          ),
          specialty,
          crp_number
        )
      `)
      .single()

    if (createError) {
      console.error('Erro ao criar consulta:', createError)
      return NextResponse.json({ error: 'Erro ao criar consulta' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Consulta solicitada com sucesso! Aguarde a confirmação da secretária ou administrador.',
      appointment: newAppointment 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
