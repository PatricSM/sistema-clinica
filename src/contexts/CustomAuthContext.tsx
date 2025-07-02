'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  initializing: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function CustomAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Função para verificar o usuário atual
  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setAuthError(null)
          return data.user
        }
      }
      
      setUser(null)
      return null
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
      return null
    }
  }

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        setAuthError(null)
        return { success: true, user: data.user }
      } else {
        setAuthError(data.message || 'Erro no login')
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = 'Erro de conexão'
      setAuthError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const logout = async () => {
    setLoading(true)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAuthError(null)
      setLoading(false)
      
      // Redirecionar para login
      window.location.href = '/login'
    }
  }

  // Função para atualizar dados do usuário
  const refreshUser = async () => {
    await checkUser()
  }

  // Verificar usuário na inicialização
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        await checkUser()
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthError('Erro ao verificar autenticação')
      } finally {
        setInitializing(false)
      }
    }

    // Timeout de 10 segundos para evitar loading infinito
    timeoutId = setTimeout(() => {
      if (initializing) {
        console.warn('⚠️ Auth initialization timeout - proceeding anyway')
        setAuthError('Timeout na verificação de autenticação')
        setInitializing(false)
      }
    }, 10000)

    initializeAuth()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const value = {
    user,
    loading,
    initializing,
    authError,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useCustomAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within a CustomAuthProvider')
  }
  return context
} 