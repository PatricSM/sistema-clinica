'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { 
  EnvelopeIcon, 
  PlusIcon, 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CursorArrowRaysIcon 
} from '@heroicons/react/24/outline'

interface EmailNotification {
  id: number
  recipient_email: string
  recipient_name: string
  subject: string
  body: string
  email_type: string
  status: 'sent' | 'opened' | 'clicked'
  sent_at: string
  opened_at?: string
  clicked_at?: string
}

export default function SecretaryEmailsPage() {
  const [emails, setEmails] = useState<EmailNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar emails:', error)
        return
      }

      setEmails(data || [])
    } catch (error) {
      console.error('Erro ao buscar emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <ClockIcon className="h-4 w-4" />
      case 'opened':
        return <EyeIcon className="h-4 w-4" />
      case 'clicked':
        return <CursorArrowRaysIcon className="h-4 w-4" />
      default:
        return <EnvelopeIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'opened':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'clicked':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado'
      case 'opened':
        return 'Aberto'
      case 'clicked':
        return 'Clicado'
      default:
        return 'Desconhecido'
    }
  }

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return 'Lembrete de Consulta'
      case 'exam_results':
        return 'Resultados de Exames'
      case 'appointment_confirmation':
        return 'Confirmação de Agendamento'
      case 'prescription':
        return 'Receita Médica'
      case 'survey':
        return 'Pesquisa'
      case 'birthday':
        return 'Aniversário'
      case 'general':
        return 'Geral'
      default:
        return 'Outros'
    }
  }

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || email.email_type === typeFilter
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: emails.length,
    sent: emails.filter(e => e.status === 'sent').length,
    opened: emails.filter(e => e.status === 'opened').length,
    clicked: emails.filter(e => e.status === 'clicked').length,
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestão de Emails
                </h1>
                <p className="text-gray-600">
                  Gerencie o envio de emails para pacientes
                </p>
              </div>
              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <PlusIcon className="h-5 w-5 mr-2" />
                Novo Email
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por destinatário ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Emails</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
              <div className="text-sm text-blue-600">Enviados</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.opened}</div>
              <div className="text-sm text-green-600">Abertos</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.clicked}</div>
              <div className="text-sm text-purple-600">Com Cliques</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Emails Enviados ({filteredEmails.length})
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando emails...</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-12">
                  <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum email encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há emails que correspondam aos filtros selecionados
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Enviar Primeiro Email
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmails.map(email => (
                    <div
                      key={email.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {email.subject}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                              {getStatusIcon(email.status)}
                              <span className="ml-1">{getStatusLabel(email.status)}</span>
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Para:</strong> {email.recipient_name} ({email.recipient_email})
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Tipo:</strong> {getEmailTypeLabel(email.email_type)}
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-2">
                            <strong>Enviado em:</strong> {new Date(email.sent_at).toLocaleString('pt-BR')}
                          </div>
                          
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                            {email.body}
                          </p>
                        </div>
                        
                        <div className="ml-4 flex flex-col gap-2">
                          <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                            Reenviar
                          </button>
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
