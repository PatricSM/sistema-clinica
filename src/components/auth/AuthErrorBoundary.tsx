'use client'

import { useEffect } from 'react'
import { validateStoredTokens, setupGlobalAuthErrorHandling } from '@/lib/auth-utils'
import { testAuth, clearAllAuthData, checkLocalStorage, testLogin, debugSupabaseStorage, checkCurrentAuth, testCustomStorageDirectly } from '@/lib/auth-test'

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  useEffect(() => {
    // Setup global error handling
    setupGlobalAuthErrorHandling()
    
    // Add debug functions to window object for console access
    if (typeof window !== 'undefined') {
      const w = window as any
      w.testAuth = () => testAuth()
      w.clearAllAuthData = () => clearAllAuthData()
      w.checkLocalStorage = () => checkLocalStorage()
      w.testLogin = () => testLogin()
      w.debugSupabaseStorage = () => debugSupabaseStorage()
      w.checkCurrentAuth = () => checkCurrentAuth()
      w.testCustomStorageDirectly = () => testCustomStorageDirectly()
      
      // Log apenas uma vez durante toda a sessão
      if (!w.debugFunctionsLogged) {
        console.log('🔧 Funções de debug disponíveis no console:')
        console.log('  - testAuth() - Testa o status da autenticação')
        console.log('  - clearAllAuthData() - Limpa todos os dados de auth')
        console.log('  - checkLocalStorage() - Verifica localStorage')
        console.log('  - testLogin() - Testa login completo com storage')
        console.log('  - debugSupabaseStorage() - Debug completo do storage')
        console.log('  - checkCurrentAuth() - Verifica estado atual da auth')
        console.log('  - testCustomStorageDirectly() - Testa storage customizado diretamente')
        w.debugFunctionsLogged = true
      }
    }
    
    // Validate stored tokens on mount
    const checkTokens = async () => {
      try {
        const isValid = await validateStoredTokens()
        if (!isValid) {
          console.log('Tokens inválidos detectados na inicialização')
        }
      } catch (error) {
        console.error('Erro ao validar tokens na inicialização:', error)
      }
    }
    
    checkTokens()
    
    // Setup error event listener
    const handleError = (event: ErrorEvent) => {
      const error = event.error
      if (error && (
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('JWT')
      )) {
        console.log('Erro de autenticação capturado globalmente')
        event.preventDefault()
      }
    }
    
    // Setup unhandled promise rejection listener
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      if (error && (
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('JWT')
      )) {
        console.log('Promise rejection de autenticação capturada globalmente')
        event.preventDefault()
      }
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
} 