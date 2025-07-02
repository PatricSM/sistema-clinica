/**
 * Utilitários para gerenciamento de autenticação e limpeza de sessão
 */

import { createClient } from '@/utils/supabase/client'

export interface AuthError {
  message: string
  status?: number
  code?: string
}

/**
 * Verifica se o erro é relacionado a refresh token inválido
 */
export function isRefreshTokenError(error: any): boolean {
  if (!error) return false
  
  const message = error.message || error.error_description || ''
  const code = error.code || ''
  
  return (
    message.includes('refresh_token_not_found') ||
    message.includes('Invalid Refresh Token') ||
    message.includes('JWT expired') ||
    message.includes('JWT') ||
    code === 'refresh_token_not_found' ||
    code === 'invalid_grant'
  )
}

/**
 * Limpa completamente a sessão local e cookies
 */
export function clearSessionData(): void {
  if (typeof window === 'undefined') return

  try {
    // Limpar localStorage
    const keysToRemove = [
      'supabase.auth.token',
      'sb-access-token',
      'sb-refresh-token',
      'sb-swnwsxfqndhcezshrivv-auth-token' // Nova chave configurada
    ]
    
    // Buscar todas as chaves que começam com 'sb-' ou contêm 'auth'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('sb-') ||
        key.includes('supabase') ||
        key.includes('auth') ||
        key.includes('swnwsxfqndhcezshrivv')
      )) {
        keysToRemove.push(key)
      }
    }
    
    // Remover duplicatas
    const uniqueKeys = [...new Set(keysToRemove)]
    
    uniqueKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log('🗑️ Removido:', key)
    })
    
    // Limpar sessionStorage
    sessionStorage.clear()
    
    console.log('✅ Dados de sessão limpos com sucesso')
  } catch (error) {
    console.error('Erro ao limpar dados de sessão:', error)
  }
}

/**
 * Força logout completo com limpeza de dados
 */
export async function forceLogout(): Promise<void> {
  try {
    const supabase = createClient()
    
    // Limpar dados locais primeiro
    clearSessionData()
    
    // Tentar fazer logout do Supabase (mas não falhar se der erro)
    try {
      await supabase.auth.signOut()
    } catch (signOutError) {
      console.warn('Erro no signOut do Supabase (ignorado):', signOutError)
    }
    
    // Redirecionar para login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Erro durante force logout:', error)
    // Em último caso, apenas redirecionar
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

/**
 * Verifica se há tokens inválidos armazenados e os limpa
 */
export async function validateStoredTokens(): Promise<boolean> {
  if (typeof window === 'undefined') return true

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()
    
    if (error && isRefreshTokenError(error)) {
      console.log('Tokens inválidos detectados, limpando...')
      clearSessionData()
      return false
    }
    
    return !!data.session
  } catch (error) {
    console.error('Erro ao validar tokens:', error)
    if (isRefreshTokenError(error)) {
      clearSessionData()
      return false
    }
    return true
  }
}

/**
 * Monitora erros de autenticação globalmente
 */
export function setupGlobalAuthErrorHandling(): void {
  if (typeof window === 'undefined') return

  // Interceptar erros de fetch relacionados à autenticação
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Se for uma requisição para Supabase e retornar 401/400
      if (args[0]?.toString().includes('supabase.co') && 
          (response.status === 401 || response.status === 400)) {
        
        const responseClone = response.clone()
        try {
          const errorData = await responseClone.json()
          if (isRefreshTokenError(errorData)) {
            console.log('Erro de token detectado via fetch, limpando sessão...')
            await forceLogout()
          }
        } catch (parseError) {
          // Ignorar erros de parsing
        }
      }
      
      return response
    } catch (error) {
      if (isRefreshTokenError(error)) {
        console.log('Erro de token detectado via catch, limpando sessão...')
        await forceLogout()
      }
      throw error
    }
  }
} 