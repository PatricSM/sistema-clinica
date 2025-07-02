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

    // Buscar profissionais ativos
    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('*')
      .eq('is_available', true)

    if (professionalsError) {
      console.error('Erro ao buscar profissionais:', professionalsError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Buscar dados dos usuários para cada profissional
    const professionalsWithUsers = await Promise.all(
      (professionals || []).map(async (professional) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name, email, phone')
          .eq('id', professional.user_id)
          .single()
        
        return {
          ...professional,
          user: userData || {
            full_name: `Profissional ${professional.id}`,
            email: 'N/A',
            phone: null
          }
        }
      })
    )

    return NextResponse.json({ 
      professionals: professionalsWithUsers || []
    })

  } catch (error) {
    console.error('💥 Erro interno completo:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
