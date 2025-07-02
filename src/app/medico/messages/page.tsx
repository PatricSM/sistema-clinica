'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: number
  patient_id: number
  patient_name: string
  content: string
  created_at: string
  read: boolean
  type: 'received' | 'sent'
}

export default function MessagesPage() {
  const { user } = useCustomAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      fetchPatients()
      fetchMessages()
    }
  }, [user])

  const fetchPatients = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patients!inner(
            id,
            user:users!inner(full_name)
          )
        `)
        .eq('professional_id', user?.id)

      if (error) throw error

      // Remover duplicados
      const uniquePatients = new Map()
      appointmentsData?.forEach((appointment: any) => {
        const patientId = appointment.patient.id
        if (!uniquePatients.has(patientId)) {
          uniquePatients.set(patientId, {
            id: patientId,
            name: appointment.patient.user.full_name
          })
        }
      })

      setPatients(Array.from(uniquePatients.values()))
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // Buscar tarefas do tipo 'message' de todos os pacientes do médico
      const { data: tasks, error } = await supabase
        .from('patient_tasks')
        .select(`
          id,
          patient_id,
          title,
          description,
          created_at,
          is_completed,
          patient:patients!inner(
            user:users!inner(full_name)
          )
        `)
        .eq('professional_id', user?.id)
        .eq('task_type', 'message')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transformar tarefas em mensagens
      const taskMessages: Message[] = tasks?.map(task => ({
        id: task.id,
        patient_id: task.patient_id,
        patient_name: task.patient.user.full_name,
        content: task.description || task.title,
        created_at: task.created_at,
        read: task.is_completed,
        type: 'received'
      })) || []

      setMessages(taskMessages)
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient) return

    const selectedPatientData = patients.find(p => p.id === selectedPatient)
    const message: Message = {
      id: Date.now(),
      patient_id: selectedPatient,
      patient_name: selectedPatientData?.name || 'Paciente',
      content: newMessage,
      created_at: new Date().toISOString(),
      read: true,
      type: 'sent'
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
  }

  const markAsRead = (messageId: number) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    )
  }

  const filteredMessages = messages.filter(msg =>
    msg.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadCount = messages.filter(msg => !msg.read && msg.type === 'received').length

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Comunicação com seus pacientes</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Não Lidas</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nova Mensagem */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Mensagem</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente
                  </label>
                  <select
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    placeholder="Digite sua mensagem..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !selectedPatient}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Mensagens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mensagens Recentes
                  </h3>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar mensagens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-6 text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !message.read && message.type === 'received' ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => message.type === 'received' && markAsRead(message.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            message.type === 'sent' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <UserIcon className={`h-6 w-6 ${
                              message.type === 'sent' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {message.type === 'sent' ? 'Você' : message.patient_name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {new Date(message.created_at).toLocaleDateString('pt-BR')}
                              </div>
                              {!message.read && message.type === 'received' && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
