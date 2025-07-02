'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  FileCheck,
  Receipt,
  Clipboard,
  FileImage,
  Search,
  Filter
} from 'lucide-react'

interface Document {
  id: number
  patient_id: number
  professional_id: number
  document_type: 'consent_form' | 'report' | 'attestation' | 'receipt' | 'contract' | 'medical_record_summary' | 'other'
  title: string
  file_url: string | null
  signed_by_patient: boolean
  signed_date: string | null
  created_at: string
  updated_at: string
}

interface DocumentWithProfessional extends Document {
  professional: {
    full_name: string
    specialty: string
  }
}

export function DocumentViewer() {
  const { user } = useCustomAuth()
  const [documents, setDocuments] = useState<DocumentWithProfessional[]>([])
  const [patientId, setPatientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  // Buscar o patient_id do usuário logado
  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user) return

      try {
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Erro ao buscar patient_id:', error)
          return
        }

        if (patientData) {
          setPatientId(patientData.id)
        }
      } catch (error) {
        console.error('Erro ao buscar patient_id:', error)
      }
    }

    fetchPatientId()
  }, [user, supabase])

  // Buscar documentos do paciente
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!patientId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            professional:professionals!inner(
              user:users!inner(full_name),
              specialty
            )
          `)
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar documentos:', error)
          return
        }

        // Transform data to match interface
        const documentsWithProfessional: DocumentWithProfessional[] = (data || []).map((doc: any) => ({
          ...doc,
          professional: {
            full_name: doc.professional?.user?.full_name || 'Profissional não encontrado',
            specialty: doc.professional?.specialty || 'Especialidade não informada'
          }
        }))

        setDocuments(documentsWithProfessional)
      } catch (error) {
        console.error('Erro ao buscar documentos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [patientId, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentTypeInfo = (type: string) => {
    const types = {
      consent_form: { 
        label: 'Termo de Consentimento', 
        icon: Shield, 
        color: 'text-blue-600 bg-blue-100',
        description: 'Documento de autorização'
      },
      report: { 
        label: 'Relatório', 
        icon: FileText, 
        color: 'text-green-600 bg-green-100',
        description: 'Relatório psicológico'
      },
      attestation: { 
        label: 'Atestado', 
        icon: FileCheck, 
        color: 'text-purple-600 bg-purple-100',
        description: 'Atestado médico'
      },
      receipt: { 
        label: 'Recibo', 
        icon: Receipt, 
        color: 'text-orange-600 bg-orange-100',
        description: 'Comprovante de pagamento'
      },
      contract: { 
        label: 'Contrato', 
        icon: Clipboard, 
        color: 'text-gray-600 bg-gray-100',
        description: 'Contrato de serviços'
      },
      medical_record_summary: { 
        label: 'Resumo do Prontuário', 
        icon: FileImage, 
        color: 'text-indigo-600 bg-indigo-100',
        description: 'Resumo médico'
      },
      other: { 
        label: 'Outros', 
        icon: FileText, 
        color: 'text-gray-600 bg-gray-100',
        description: 'Documento geral'
      }
    }
    return types[type as keyof typeof types] || types.other
  }

  const handleDownload = (doc: DocumentWithProfessional) => {
    // Simulação de download - em produção seria uma URL real
    const link = document.createElement('a')
    link.href = doc.file_url || '#'
    link.download = `${doc.title}.pdf`
    link.click()
    
    // Feedback visual
    alert(`Download iniciado: ${doc.title}`)
  }

  const handleView = (doc: DocumentWithProfessional) => {
    // Simulação de visualização - em produção abriria um modal ou nova aba
    alert(`Visualizando: ${doc.title}\n\nEm produção, este documento seria aberto em uma nova aba ou modal para visualização.`)
  }

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.document_type === selectedType
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.professional.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Agrupar documentos por tipo
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const type = doc.document_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(doc)
    return acc
  }, {} as Record<string, DocumentWithProfessional[]>)

  // Estatísticas
  const totalDocuments = documents.length
  const signedDocuments = documents.filter(doc => doc.signed_by_patient).length
  const recentDocuments = documents.filter(doc => {
    const docDate = new Date(doc.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return docDate >= thirtyDaysAgo
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Documentos</h2>
        <p className="text-gray-600">Acesse seus documentos médicos, relatórios e comprovantes</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos Assinados</p>
                <p className="text-2xl font-bold text-gray-900">{signedDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Recentes (30 dias)</p>
                <p className="text-2xl font-bold text-gray-900">{recentDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por título ou profissional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="sm:w-64">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os tipos</option>
                <option value="consent_form">Termos de Consentimento</option>
                <option value="report">Relatórios</option>
                <option value="attestation">Atestados</option>
                <option value="receipt">Recibos</option>
                <option value="medical_record_summary">Resumos</option>
                <option value="other">Outros</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedType !== 'all' 
                  ? 'Nenhum documento encontrado' 
                  : 'Nenhum documento disponível'
                }
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedType !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Seus documentos aparecerão aqui quando forem disponibilizados.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => {
            const typeInfo = getDocumentTypeInfo(type)
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <typeInfo.icon className="h-5 w-5 text-gray-600" />
                    <span>{typeInfo.label}</span>
                    <span className="text-sm font-normal text-gray-500">({docs.length})</span>
                  </CardTitle>
                  <CardDescription>{typeInfo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-3 rounded-full ${typeInfo.color}`}>
                            <typeInfo.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {doc.professional.full_name}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(doc.created_at)}
                              </span>
                              {doc.signed_by_patient && (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Assinado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(doc)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Informação sobre assinatura digital */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Sobre os documentos</h5>
              <p className="text-sm text-blue-700">
                Os documentos marcados como "Assinados" possuem validade legal. Para questões sobre 
                algum documento, entre em contato com o profissional responsável. Todos os downloads 
                são registrados para sua segurança.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
