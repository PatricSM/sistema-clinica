import { NextRequest, NextResponse } from 'next/server'
import { validateAuthToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const appointmentId = resolvedParams.id
    const body = await request.json()
    const { status, notes } = body

    // Validar status
    const validStatuses = ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Status inválido. Valores permitidos: ' + validStatuses.join(', ')
      }, { status: 400 })
    }

    // Verificar se a consulta existe
    const { data: existingAppointment, error: findError } = await supabase
      .from('appointments')
      .select('id, status, patient_id, professional_id')
      .eq('id', appointmentId)
      .single()

    if (findError || !existingAppointment) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Atualizar a consulta
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
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

    if (updateError) {
      console.error('Erro ao atualizar consulta:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar consulta' }, { status: 500 })
    }

    // Mensagem baseada no status
    let message = 'Consulta atualizada com sucesso!'
    
    if (status === 'confirmed' && existingAppointment.status === 'scheduled') {
      message = 'Consulta aprovada com sucesso!'
    } else if (status === 'cancelled' && existingAppointment.status === 'scheduled') {
      message = 'Consulta rejeitada com sucesso!'
    }

    return NextResponse.json({ 
      message,
      appointment: updatedAppointment 
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const appointmentId = resolvedParams.id

    // Verificar se a consulta existe
    const { data: existingAppointment, error: findError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', appointmentId)
      .single()

    if (findError || !existingAppointment) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Deletar a consulta
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Erro ao deletar consulta:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar consulta' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Consulta deletada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
