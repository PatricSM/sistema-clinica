import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://swnwsxfqndhcezshrivv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bndzeGZxbmRoY2V6c2hyaXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjE0NjcsImV4cCI6MjA2NjYzNzQ2N30.k8NB4DFSDYpLtSFFR21C0wZLtEICCBxmqRiGdVAVoCg'

// Create a single instance to be reused
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing instance if available
  if (clientInstance) {
    console.log('♻️ Reutilizando instância existente do cliente Supabase')
    return clientInstance
  }

  console.log('🆕 Criando nova instância do cliente Supabase')
  
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'sb-swnwsxfqndhcezshrivv-auth-token',
      storage: {
        getItem: (key: string) => {
          if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key)
            console.log('🔍 CUSTOM STORAGE getItem:', key, item ? '✅ FOUND' : '❌ NOT FOUND')
            if (item) {
              console.log('📄 Token content (first 100 chars):', item.substring(0, 100) + '...')
            }
            return item
          }
          return null
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            console.log('💾 CUSTOM STORAGE setItem:', key, '🔐 STORING TOKEN!')
            console.log('📝 Value length:', value.length, 'chars')
            console.log('📄 Token preview:', value.substring(0, 100) + '...')
            localStorage.setItem(key, value)
            
            // Verificar se foi realmente armazenado
            const verification = localStorage.getItem(key)
            console.log('✅ Verification - stored successfully:', !!verification)
            if (verification) {
              console.log('🎯 SUCESSO! Token armazenado no localStorage')
            } else {
              console.error('❌ FALHA! Token NÃO foi armazenado')
            }
          }
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            console.log('🗑️ CUSTOM STORAGE removeItem:', key)
            localStorage.removeItem(key)
            console.log('✅ Token removido do localStorage')
          }
        }
      }
    }
  })
  
  console.log('🎯 Cliente Supabase criado com storage customizado!')
  return clientInstance
} 