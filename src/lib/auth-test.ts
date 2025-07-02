/**
 * Utilitário para testar e diagnosticar problemas de autenticação
 * Use no console do navegador para debug
 */

import { createClient } from '@/utils/supabase/client'
import { clearSessionData, isRefreshTokenError } from './auth-utils'

export async function testAuth() {
  const supabase = createClient()
  
  console.log('🔍 Testando autenticação...')
  
  try {
    // Testar sessão atual
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError)
      if (isRefreshTokenError(sessionError)) {
        console.log('🧹 Limpando tokens inválidos...')
        clearSessionData()
        return { status: 'token_cleared', error: sessionError }
      }
      return { status: 'session_error', error: sessionError }
    }
    
    if (!session.session) {
      console.log('ℹ️ Nenhuma sessão ativa')
      return { status: 'no_session' }
    }
    
    // Testar usuário atual
    const { data: user, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erro no usuário:', userError)
      if (isRefreshTokenError(userError)) {
        console.log('🧹 Limpando tokens inválidos...')
        clearSessionData()
        return { status: 'token_cleared', error: userError }
      }
      return { status: 'user_error', error: userError }
    }
    
    console.log('✅ Autenticação funcionando!')
    console.log('👤 Usuário:', user.user?.email)
    console.log('⏰ Sessão expira em:', new Date(session.session.expires_at! * 1000))
    
    return { 
      status: 'success', 
      user: user.user, 
      session: session.session,
      expiresAt: new Date(session.session.expires_at! * 1000)
    }
  } catch (error) {
    console.error('💥 Erro crítico:', error)
    if (isRefreshTokenError(error)) {
      console.log('🧹 Limpando tokens inválidos...')
      clearSessionData()
      return { status: 'token_cleared', error }
    }
    return { status: 'critical_error', error }
  }
}

export function clearAllAuthData(): void {
  console.log('🧹 Limpando todos os dados de autenticação...')
  clearSessionData()
  console.log('✅ Dados limpos!')
}

export async function testLogin(): Promise<void> {
  const supabase = createClient()
  
  console.log('🧪 Testando processo de login completo...')
  
  // 1. Verificar localStorage antes do login
  console.log('📋 Estado ANTES do login:')
  checkLocalStorage()
  
  try {
    // 2. Limpar qualquer sessão existente
    console.log('🧹 Limpando sessão anterior...')
    await supabase.auth.signOut()
    
    // 3. Fazer login com conta de teste
    console.log('🔐 Fazendo login...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@clinica.com',
      password: 'password123'
    })
    
    if (error) {
      console.error('❌ Erro no login:', error)
      return
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log('👤 Usuário:', data.user?.email)
    console.log('🆔 ID:', data.user?.id)
    console.log('📅 Sessão expira:', new Date(data.session?.expires_at! * 1000))
    console.log('🔑 Access token (primeiros 50 chars):', data.session?.access_token?.substring(0, 50) + '...')
    console.log('🔄 Refresh token (primeiros 30 chars):', data.session?.refresh_token?.substring(0, 30) + '...')
    
    // 4. Verificar localStorage imediatamente
    console.log('📋 Estado IMEDIATAMENTE após login:')
    checkLocalStorage()
    
    // 5. Aguardar e verificar novamente
    setTimeout(() => {
      console.log('📋 Estado APÓS 1 segundo:')
      checkLocalStorage()
    }, 1000)
    
    // 6. Aguardar mais tempo e verificar novamente  
    setTimeout(() => {
      console.log('📋 Estado APÓS 3 segundos:')
      checkLocalStorage()
    }, 3000)
    
  } catch (error) {
    console.error('💥 Erro no teste de login:', error)
  }
}

export async function checkCurrentAuth(): Promise<void> {
  const supabase = createClient()
  
  console.log('🔍 Verificando estado atual da autenticação...')
  
  try {
    // Verificar sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError)
      return
    }
    
    if (sessionData.session) {
      console.log('✅ Sessão ATIVA encontrada!')
      console.log('👤 Email:', sessionData.session.user?.email)
      console.log('⏰ Expira em:', new Date(sessionData.session.expires_at! * 1000))
      console.log('🔄 Válida por mais:', Math.round((sessionData.session.expires_at! * 1000 - Date.now()) / 1000 / 60), 'minutos')
    } else {
      console.log('❌ Nenhuma sessão ativa encontrada')
    }
    
    // Verificar usuário
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError)
    } else if (userData.user) {
      console.log('👤 Usuário autenticado:', userData.user.email)
    } else {
      console.log('❌ Nenhum usuário autenticado')
    }
    
    // Verificar localStorage após verificação
    console.log('📦 localStorage atual:')
    checkLocalStorage()
    
  } catch (error) {
    console.error('💥 Erro crítico na verificação:', error)
  }
}

export function debugSupabaseStorage(): void {
  console.log('🔧 Debug do Storage do Supabase:')
  
  // 1. Testar localStorage básico
  console.log('🌐 localStorage disponível:', typeof localStorage !== 'undefined')
  console.log('🌐 Tipo window:', typeof window !== 'undefined')
  
  if (typeof localStorage === 'undefined') {
    console.error('❌ localStorage não está disponível!')
    return
  }
  
  // 2. Testar operações básicas do localStorage
  const testKey = 'test-storage-key'
  const testValue = JSON.stringify({ test: 'value', timestamp: Date.now() })
  
  try {
    console.log('🧪 Testando localStorage básico...')
    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    console.log('💾 localStorage funciona:', retrieved ? '✅ SIM' : '❌ NÃO')
    if (retrieved) {
      console.log('📝 Valor recuperado:', JSON.parse(retrieved))
    }
    localStorage.removeItem(testKey)
    console.log('🗑️ Remoção funcionou:', !localStorage.getItem(testKey))
  } catch (error) {
    console.error('❌ Erro no teste localStorage:', error)
    return
  }
  
  // 3. Verificar configuração do Supabase
  const supabase = createClient()
  console.log('📱 Cliente Supabase criado:', !!supabase)
  console.log('🔐 Auth disponível:', !!(supabase as any).auth)
  
  // 4. Verificar configurações de auth
  const authConfig = (supabase as any).auth
  if (authConfig) {
    console.log('🔐 Auth storageKey:', authConfig.storageKey || 'NÃO DEFINIDO')
    console.log('🔐 Auth storage:', !!authConfig.storage)
    console.log('🔐 Auth storage type:', typeof authConfig.storage)
    
    // Testar storage customizado diretamente
    if (authConfig.storage) {
      console.log('🧪 Testando storage customizado...')
      const testStorageKey = 'test-auth-storage'
      const testStorageValue = JSON.stringify({ test: 'custom storage', timestamp: Date.now() })
      
      try {
        authConfig.storage.setItem(testStorageKey, testStorageValue)
        const retrievedFromCustom = authConfig.storage.getItem(testStorageKey)
        console.log('🎯 Storage customizado funciona:', retrievedFromCustom ? '✅ SIM' : '❌ NÃO')
        if (retrievedFromCustom) {
          console.log('📝 Valor do storage customizado:', JSON.parse(retrievedFromCustom))
        }
        authConfig.storage.removeItem(testStorageKey)
      } catch (error) {
        console.error('❌ Erro no teste storage customizado:', error)
      }
    }
  }
  
  // 5. Testar se há sessão ativa
  supabase.auth.getSession().then(({ data, error }: { data: any, error: any }) => {
    console.log('👤 Sessão atual:', data.session ? '✅ ATIVA' : '❌ NENHUMA')
    if (data.session) {
      console.log('📧 Email:', data.session.user?.email)
      console.log('⏰ Expira em:', new Date(data.session.expires_at! * 1000))
    }
    if (error) {
      console.error('❌ Erro na sessão:', error)
    }
  })
  
  // 6. Verificar configuração explícita de storage
  console.log('🔧 Forçando teste de storage manual...')
  const storageKey = 'sb-swnwsxfqndhcezshrivv-auth-token'
  const mockToken = {
    access_token: 'mock_token_' + Date.now(),
    refresh_token: 'mock_refresh_' + Date.now(),
    user: { email: 'test@test.com' }
  }
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(mockToken))
    const stored = localStorage.getItem(storageKey)
    console.log('🧪 Teste storage manual:', stored ? '✅ FUNCIONOU' : '❌ FALHOU')
    if (stored) {
      console.log('📝 Token mock armazenado:', JSON.parse(stored))
    }
    // Remover o mock
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('❌ Erro no teste storage manual:', error)
  }
}

export async function testCustomStorageDirectly(): Promise<void> {
  console.log('🔬 Testando storage customizado diretamente...')
  
  const supabase = createClient()
  const authConfig = (supabase as any).auth
  
  if (!authConfig || !authConfig.storage) {
    console.error('❌ Storage customizado não encontrado!')
    return
  }
  
  const testKey = 'direct-storage-test'
  const testValue = JSON.stringify({
    access_token: 'test_token_' + Date.now(),
    refresh_token: 'test_refresh_' + Date.now(),
    user: { email: 'test@direct.com' }
  })
  
  try {
    console.log('💾 Chamando setItem diretamente...')
    authConfig.storage.setItem(testKey, testValue)
    
    console.log('🔍 Chamando getItem diretamente...')
    const retrieved = authConfig.storage.getItem(testKey)
    
    console.log('✅ Resultado:', retrieved ? 'FUNCIONOU' : 'FALHOU')
    if (retrieved) {
      console.log('📄 Dados recuperados:', JSON.parse(retrieved))
    }
    
    console.log('🗑️ Removendo teste...')
    authConfig.storage.removeItem(testKey)
    
    // Verificar localStorage diretamente
    console.log('🔍 Verificando localStorage após teste direto:')
    checkLocalStorage()
    
  } catch (error) {
    console.error('❌ Erro no teste direto:', error)
  }
}

export function checkLocalStorage(): string[] {
  if (typeof window === 'undefined') {
    console.log('❌ localStorage não disponível (servidor)')
    return []
  }
  
  console.log('🔍 Verificando localStorage...')
  
  // Mostrar TODAS as chaves primeiro
  const allKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      allKeys.push(key)
    }
  }
  
  console.log('📦 TODAS as chaves no localStorage:', allKeys)
  
  // Filtrar chaves de autenticação (busca mais abrangente)
  const authKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth') ||
      key.includes('token') ||
      key.includes('session') ||
      key.includes('swnwsxfqndhcezshrivv') // Project ref específico
    )) {
      authKeys.push(key)
    }
  }
  
  console.log('🔑 Chaves de autenticação encontradas:', authKeys)
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        const parsed = JSON.parse(value)
        console.log(`📝 ${key}:`, parsed)
      } catch {
        console.log(`📝 ${key}:`, value.substring(0, 100) + '...')
      }
    }
  })
  
  // Se não encontrar nada, mostrar todas as chaves e valores
  if (authKeys.length === 0) {
    console.log('⚠️ Nenhuma chave de auth encontrada, mostrando TUDO:')
    allKeys.forEach(key => {
      const value = localStorage.getItem(key)
      console.log(`🗂️ ${key}:`, value?.substring(0, 100) + '...')
    })
  }
  
  return authKeys
}

// Para usar no console do navegador:
// import { testAuth, clearAllAuthData, checkLocalStorage } from '@/lib/auth-test'
// testAuth()
// checkLocalStorage()
// clearAllAuthData() 