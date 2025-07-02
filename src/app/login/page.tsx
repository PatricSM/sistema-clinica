'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useCustomAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email e senha são obrigatórios')
      return
    }

    try {
      const result = await login(email, password)
      
      if (result.success && result.user) {
        // Redirecionar baseado no role do usuário
        const roleRedirects = {
          admin: '/admin',
          professional: '/medico',
          secretary: '/secretaria',
          patient: '/paciente'
        }
        
        const redirectPath = roleRedirects[result.user.role as keyof typeof roleRedirects] || '/admin'
        router.push(redirectPath)
      } else {
        setError(result.message || 'Erro no login')
      }
    } catch (error) {
      setError('Erro de conexão')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema Clínica
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Contas Demo:</h3>
          <div className="space-y-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <strong>Admin:</strong> admin@clinica.com / password123
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Médico:</strong> maria.santos@clinica.com / password123
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Secretária:</strong> secretaria@clinica.com / password123
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Paciente:</strong> pedro.paciente@email.com / password123
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 