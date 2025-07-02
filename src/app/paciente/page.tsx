'use client'

import { PacienteDashboard } from '@/components/paciente/PacienteDashboard'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import MainLayout from '@/components/layout/MainLayout'

export default function PacientePage() {
  const { user, loading, initializing } = useCustomAuth()

  // Mostrar loading enquanto inicializa
  if (initializing || loading) {
    return <LoadingScreen />
  }

  // Se não há usuário, algo deu errado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro de Autenticação
          </h2>
          <p className="text-gray-600">
            Usuário não encontrado. Tente fazer login novamente.
          </p>
        </div>
      </div>
    )
  }

  // Verificar se é realmente um paciente
  if (user.role !== 'patient') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Esta área é restrita a pacientes.
          </p>
        </div>
      </div>
    )
  }

  // Passar os dados corretos do usuário
  return (
    <MainLayout>
      <PacienteDashboard 
        paciente={{
          nome: user.full_name,
          proximaConsulta: '2024-01-15 14:00',
          medicoAtual: 'Dr. João Santos'
        }}
      />
    </MainLayout>
  )
} 