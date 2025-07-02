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

    // Verificar se o usuário é admin ou secretary
    if (user.role !== 'admin' && user.role !== 'secretary') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const professional_id = searchParams.get('professional_id')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    // Construir query
    let query = supabase
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
        patient:patients!appointments_patient_id_fkey(
          user:users!patients_user_id_fkey(
            full_name,
            email,
            phone
          )
        ),
        professional:professionals!appointments_professional_id_fkey(
          user:users!professionals_user_id_fkey(
            full_name,
            email
          ),
          specialty,
          crp_number
        )
      `)

    // Aplicar filtros
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (professional_id) {
      query = query.eq('professional_id', professional_id)
    }

    if (date_from) {
      query = query.gte('start_time', date_from)
    }

    if (date_to) {
      query = query.lte('start_time', date_to)
    }

    const { data: appointments, error: appointmentsError } = await query
      .order('start_time', { ascending: true })

    if (appointmentsError) {
      console.error('Erro ao buscar consultas:', appointmentsError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({ 
      appointments: appointments || []
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Verificar se o usuário é admin ou secretary
    if (user.role !== 'admin' && user.role !== 'secretary') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { patient_id, professional_id, start_time, end_time, notes } = body

    // Validações básicas
    if (!patient_id || !professional_id || !start_time || !end_time) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: patient_id, professional_id, start_time, end_time' 
      }, { status: 400 })
    }

    // Verificar se o paciente existe
    const { data: patientExists, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patient_id)
      .single()

    if (patientError || !patientExists) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
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

    // Verificar se não há conflito de horário
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

    // Criar nova consulta com status confirmado
    const { data: newAppointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        professional_id,
        start_time,
        end_time,
        status: 'confirmed', // Status confirmado para consultas criadas pela secretária/admin
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
        patient:patients!appointments_patient_id_fkey(
          user:users!patients_user_id_fkey(
            full_name,
            email,
            phone
          )
        ),
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
      message: 'Consulta criada com sucesso!',
      appointment: newAppointment 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
