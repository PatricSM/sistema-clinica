import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { MedicoDashboard } from '@/components/medico/MedicoDashboard'
import { SecretariaDashboard } from '@/components/secretaria/SecretariaDashboard'
import { PacienteDashboard } from '@/components/paciente/PacienteDashboard'

export default async function Home() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Get user details from database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (userError || !userData) {
    console.error('Erro ao buscar dados do usuário:', userError)
    redirect('/login')
  }

  // Debug log para verificar os dados do usuário
  console.log('🔍 Debug - Dados do usuário logado:', {
    id: userData.id,
    email: userData.email,
    full_name: userData.full_name,
    role: userData.role
  })

  // Render appropriate dashboard based on user role
  switch (userData.role) {
    case 'admin':
      return <AdminDashboard />
    case 'professional':
      return <MedicoDashboard />
    case 'secretary':
      return <SecretariaDashboard />
    case 'patient':
      const pacienteData = {
        nome: userData.full_name,
        proximaConsulta: '2024-01-15 14:00',
        medicoAtual: 'Dr. João Santos'
      }
      console.log('🔍 Debug - Dados enviados para PacienteDashboard:', pacienteData)
      return (
        <PacienteDashboard 
          paciente={pacienteData}
        />
      )
    default:
      redirect('/login')
  }
}
