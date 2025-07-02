'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { 
  ArrowPathIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

interface BackupHistory {
  id: string
  type: 'manual' | 'automatic'
  status: 'success' | 'failed' | 'in_progress'
  date: string
  size: string
  duration: string
  description: string
}

export default function BackupPage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'incremental' | 'database' | 'files'>('full')

  // Estado dinâmico baseado no sistema
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [systemStats, setSystemStats] = useState({
    totalBackups: 0,
    successRate: 100,
    totalSize: '0 GB',
    lastBackup: new Date().toISOString(),
    nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    retention: '90 dias'
  })

  useEffect(() => {
    // Simular carregamento de dados reais
    setSystemStats({
      totalBackups: Math.floor(Math.random() * 100) + 20,
      successRate: 95 + Math.random() * 5,
      totalSize: `${Math.floor(Math.random() * 200) + 50} GB`,
      lastBackup: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      retention: '90 dias'
    })
  }, [])

  const handleStartBackup = async () => {
    setIsBackingUp(true)
    // Simular processo de backup
    setTimeout(() => {
      setIsBackingUp(false)
    }, 5000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'in_progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Sucesso'
      case 'failed':
        return 'Falhou'
      case 'in_progress':
        return 'Em progresso'
      default:
        return 'Pendente'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Backup</h1>
          <p className="text-gray-600">Gerencie backups e restaurações do sistema</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total de Backups</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalBackups}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.successRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CloudArrowDownIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tamanho Total</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalSize}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Próximo Backup</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(systemStats.nextScheduled).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Backup */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Criar Novo Backup</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tipo de Backup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Backup
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backupType"
                      value="full"
                      checked={selectedBackupType === 'full'}
                      onChange={(e) => setSelectedBackupType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Completo (todas as tabelas e arquivos)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backupType"
                      value="incremental"
                      checked={selectedBackupType === 'incremental'}
                      onChange={(e) => setSelectedBackupType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Incremental (apenas alterações)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backupType"
                      value="database"
                      checked={selectedBackupType === 'database'}
                      onChange={(e) => setSelectedBackupType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Apenas banco de dados</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backupType"
                      value="files"
                      checked={selectedBackupType === 'files'}
                      onChange={(e) => setSelectedBackupType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Apenas arquivos</span>
                  </label>
                </div>
              </div>

              {/* Informações do Backup */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Componentes incluídos:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <span>Dados de pacientes e usuários</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Agendamentos e consultas</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    <span>Prontuários e documentos</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    <span>Dados financeiros</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        O backup pode demorar alguns minutos dependendo do tamanho dos dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleStartBackup}
                disabled={isBackingUp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBackingUp ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Criando Backup...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Iniciar Backup
                  </>
                )}
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                Restaurar Backup
              </button>
            </div>
          </div>
        </div>

        {/* Histórico de Backups */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Backups</h3>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isBackingUp && (
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Em progresso
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date().toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Manual
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Backup {selectedBackupType} em execução
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                  </tr>
                )}
                {backupHistory.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                          {getStatusText(backup.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.date).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {backup.status === 'success' && (
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Download
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Restaurar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
