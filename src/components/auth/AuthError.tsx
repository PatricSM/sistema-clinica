'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AuthErrorProps {
  error?: string
  onRetry?: () => void
  onGoHome?: () => void
}

export function AuthError({ 
  error = "Erro na autenticação", 
  onRetry,
  onGoHome 
}: AuthErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        {/* Ícone de erro */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        {/* Título e mensagem */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Ops! Algo deu errado
          </h1>
          <p className="text-gray-600">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Tente novamente ou entre em contato com o suporte se o problema persistir.
          </p>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir para Login
          </Button>
        </div>
        
        {/* Informações de debug (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">
              Debug Info (Development Only):
            </h3>
            <code className="text-xs text-gray-600 break-all">
              {error}
            </code>
          </div>
        )}
      </div>
    </div>
  )
} 