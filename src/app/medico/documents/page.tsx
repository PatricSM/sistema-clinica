'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { supabase } from '@/lib/supabase'
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  FolderOpenIcon,
  CalendarIcon,
  UserIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'

interface Document {
  id: number
  title: string
  type: string
  patient_id: number
  patient_name: string
  created_at: string
  status: 'draft' | 'sent' | 'viewed'
  notes: string
}

export default function MedicalDocumentsPage() {
  const { user } = useCustomAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    
    // Primeiro, buscar o professional_id baseado no user_id
    const { data: professionalData, error: professionalError } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (professionalError) {
      console.error('Erro ao buscar professional:', professionalError)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('documents')
      .select(`
        id, 
        title, 
        document_type, 
        created_at, 
        signed_by_patient,
        patient_id,
        patients!inner(
          id,
          users!inner(
            full_name
          )
        )
      `)
      .eq('professional_id', professionalData.id)

    if (error) {
      console.error('Erro ao buscar documentos:', error)
    } else {
      // Transformação para o tipo de dado esperado
      const transformedData = data.map((doc: any) => {
        const status: 'draft' | 'sent' | 'viewed' = doc.signed_by_patient ? 'viewed' : 'sent'
        
        return {
          id: doc.id,
          title: doc.title,
          type: doc.document_type,
          patient_id: doc.patient_id,
          patient_name: doc.patients.users.full_name,
          created_at: doc.created_at,
          status,
          notes: `Documento tipo: ${doc.document_type}`,
        }
      })
      setDocuments(transformedData)
    }
    setLoading(false)
  }

  const documentTypes = [
    { value: 'receita', label: 'Receita Médica', icon: ReceiptPercentIcon, color: 'bg-green-100 text-green-800' },
    { value: 'atestado', label: 'Atestado Médico', icon: ClipboardDocumentCheckIcon, color: 'bg-blue-100 text-blue-800' },
    { value: 'declaracao', label: 'Declaração', icon: DocumentDuplicateIcon, color: 'bg-purple-100 text-purple-800' },
    { value: 'relatorio', label: 'Relatório', icon: DocumentTextIcon, color: 'bg-orange-100 text-orange-800' },
    { value: 'laudo', label: 'Laudo', icon: FolderOpenIcon, color: 'bg-red-100 text-red-800' },
    { value: 'encaminhamento', label: 'Encaminhamento', icon: DocumentTextIcon, color: 'bg-yellow-100 text-yellow-800' }
  ]

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'viewed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'sent':
        return 'Enviado'
      case 'viewed':
        return 'Visualizado'
      default:
        return 'Desconhecido'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent').length,
    viewed: documents.filter(d => d.status === 'viewed').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Documentos Médicos
                </h1>
                <p className="text-gray-600">
                  Gerencie receitas, atestados, laudos e outros documentos
                </p>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5 mr-2" />
                Novo Documento
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Documentos</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Rascunhos</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
              <div className="text-sm text-blue-600">Enviados</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.viewed}</div>
              <div className="text-sm text-green-600">Visualizados</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por título ou paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviado</option>
                  <option value="viewed">Visualizado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Documentos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Documentos ({filteredDocuments.length})
              </h2>
            </div>

            <div className="p-6">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há documentos que correspondam aos filtros selecionados
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Criar Primeiro Documento
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map(document => (
                    <div
                      key={document.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {document.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(document.created_at)}
                            </span>
                            <span className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {document.patient_name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {document.notes}
                          </p>
                        </div>

                        <div className="ml-4 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                            {getStatusLabel(document.status)}
                          </span>
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            <ArrowDownTrayIcon className="h-5 w-5" />
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

