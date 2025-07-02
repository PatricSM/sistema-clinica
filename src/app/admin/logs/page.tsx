'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface LogEntry {
  id: number
  timestamp: string
  user: string
  action: string
  resource: string
  level: 'success' | 'info' | 'warning' | 'error'
  details: string
  ip_address: string
}

export default function AdminLogsPage() {
  const { user } = useCustomAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('logs')
        .select(`
          id,
          action,
          table_name,
          record_id,
          old_values,
          new_values,
          created_at,
          users(
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Erro ao buscar logs:', error)
        return
      }

      // Transformar dados para o formato esperado
      const transformedLogs: LogEntry[] = data.map((log: any) => {
        const userEmail = log.users?.email || 'Sistema'
        const userName = log.users?.full_name || 'Sistema'
        
        // Determinar nível baseado na ação
        let level: 'success' | 'info' | 'warning' | 'error' = 'info'
        if (log.action.includes('CREATE') || log.action.includes('LOGIN_SUCCESS')) {
          level = 'success'
        } else if (log.action.includes('DELETE') || log.action.includes('ERROR') || log.action.includes('FAILED')) {
          level = 'error'
        } else if (log.action.includes('UPDATE') || log.action.includes('MODIFY')) {
          level = 'warning'
        }

        // Criar detalhes baseados nos dados
        let details = `Ação realizada na tabela: ${log.table_name || 'desconhecida'}`
        if (log.record_id) {
          details += ` (ID: ${log.record_id})`
        }
        if (log.old_values && log.new_values) {
          details += ' - Dados modificados'
        } else if (log.new_values) {
          details += ' - Novos dados criados'
        } else if (log.old_values) {
          details += ' - Dados removidos'
        }

        return {
          id: log.id,
          timestamp: log.created_at,
          user: userEmail,
          action: log.action,
          resource: log.table_name || 'system',
          level: level,
          details: details,
          ip_address: '192.168.1.1' // Placeholder - seria necessário adicionar IP tracking
        }
      })

      setLogs(transformedLogs)
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'info':
        return <InformationCircleIcon className="h-4 w-4" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'error':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    
    return matchesSearch && matchesLevel
  })

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.level === 'success').length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Logs de Auditoria
            </h1>
            <p className="text-gray-600">
              Monitore atividades e eventos do sistema
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-green-600">Sucesso</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
              <div className="text-sm text-blue-600">Info</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <div className="text-sm text-yellow-600">Avisos</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-red-600">Erros</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por usuário, ação ou detalhes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="success">Sucesso</option>
                  <option value="info">Informação</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Eventos do Sistema ({filteredLogs.length})
              </h2>
            </div>

            <div className="p-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum log encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há logs que correspondam aos filtros selecionados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                              {getLevelIcon(log.level)}
                              <span className="ml-1 capitalize">{log.level}</span>
                            </span>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1">
                            {log.action.replace(/_/g, ' ')}
                          </h3>
                          
                          <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                            <span className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {log.user}
                            </span>
                            <span>Resource: {log.resource}</span>
                            <span>IP: {log.ip_address}</span>
                          </div>

                          <p className="text-sm text-gray-600">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
