'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  FileText, 
  Send, 
  Download, 
  Eye,
  Search, 
  Filter,
  Plus,
  Mail,
  MessageSquare,
  Check,
  Clock,
  AlertCircle,
  Paperclip,
  Calendar,
  User,
  Receipt,
  FileCheck,
  File,
  Printer
} from 'lucide-react'

interface Documento {
  id: string
  tipo: 'recibo' | 'declaracao' | 'atestado' | 'receita' | 'exame' | 'relatorio'
  titulo: string
  paciente: {
    nome: string
    email: string
    telefone: string
  }
  consulta?: {
    data: string
    medico: string
    valor: number
  }
  arquivo?: string
  status: 'pendente' | 'enviado' | 'visualizado' | 'erro'
  dataGeracao: string
  dataEnvio?: string
  observacoes?: string
  destinatario: string
  formaEnvio: 'email' | 'whatsapp' | 'impressao' | 'download'
}

export function DocumentosGestao() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showNewDocument, setShowNewDocument] = useState(false)

  // Dados de exemplo
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: '1',
      tipo: 'recibo',
      titulo: 'Recibo de Consulta - Cardiologia',
      paciente: {
        nome: 'Ana Maria Costa',
        email: 'ana@email.com',
        telefone: '(11) 99999-1111'
      },
      consulta: {
        data: '2024-06-20',
        medico: 'Dr. João Santos',
        valor: 200
      },
      status: 'enviado',
      dataGeracao: '2024-06-20',
      dataEnvio: '2024-06-20',
      destinatario: 'ana@email.com',
      formaEnvio: 'email'
    },
    {
      id: '2',
      tipo: 'declaracao',
      titulo: 'Declaração de Comparecimento',
      paciente: {
        nome: 'Pedro Silva Santos',
        email: 'pedro@email.com',
        telefone: '(11) 99999-3333'
      },
      consulta: {
        data: '2024-06-25',
        medico: 'Dra. Maria Lima',
        valor: 150
      },
      status: 'pendente',
      dataGeracao: '2024-06-25',
      destinatario: 'pedro@email.com',
      formaEnvio: 'email',
      observacoes: 'Paciente solicitou declaração para trabalho'
    },
    {
      id: '3',
      tipo: 'receita',
      titulo: 'Receita Médica - Medicamentos',
      paciente: {
        nome: 'Lucia Santos Oliveira',
        email: 'lucia@email.com',
        telefone: '(11) 99999-5555'
      },
      consulta: {
        data: '2024-07-01',
        medico: 'Dr. João Santos',
        valor: 250
      },
      status: 'visualizado',
      dataGeracao: '2024-07-01',
      dataEnvio: '2024-07-01',
      destinatario: '(11) 99999-5555',
      formaEnvio: 'whatsapp'
    },
    {
      id: '4',
      tipo: 'atestado',
      titulo: 'Atestado Médico - 2 dias',
      paciente: {
        nome: 'Carlos Mendes',
        email: 'carlos@email.com',
        telefone: '(11) 99999-7777'
      },
      status: 'erro',
      dataGeracao: '2024-07-01',
      destinatario: 'carlos@email.com',
      formaEnvio: 'email',
      observacoes: 'Erro no envio - email inválido'
    }
  ])

  const tiposDocumento = [
    { value: 'recibo', label: 'Recibo' },
    { value: 'declaracao', label: 'Declaração' },
    { value: 'atestado', label: 'Atestado' },
    { value: 'receita', label: 'Receita' },
    { value: 'exame', label: 'Exame' },
    { value: 'relatorio', label: 'Relatório' }
  ]

  const formasEnvio = [
    { value: 'email', label: 'E-mail', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'impressao', label: 'Impressão', icon: Printer },
    { value: 'download', label: 'Download', icon: Download }
  ]

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === 'todos' || documento.tipo === tipoFilter
    const matchesStatus = statusFilter === 'todos' || documento.status === statusFilter

    return matchesSearch && matchesTipo && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado':
        return 'bg-green-100 text-green-800'
      case 'visualizado':
        return 'bg-blue-100 text-blue-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'erro':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'enviado':
        return 'Enviado'
      case 'visualizado':
        return 'Visualizado'
      case 'pendente':
        return 'Pendente'
      case 'erro':
        return 'Erro'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return Check
      case 'visualizado':
        return Eye
      case 'pendente':
        return Clock
      case 'erro':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'recibo':
        return Receipt
      case 'declaracao':
        return FileCheck
      case 'atestado':
        return FileText
      case 'receita':
        return File
      case 'exame':
        return FileText
      case 'relatorio':
        return FileText
      default:
        return FileText
    }
  }

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposDocumento.find(t => t.value === tipo)
    return tipoObj ? tipoObj.label : tipo
  }

  const handleSendDocument = (id: string) => {
    setDocumentos(prev =>
      prev.map(doc =>
        doc.id === id
          ? { ...doc, status: 'enviado', dataEnvio: new Date().toISOString().split('T')[0] }
          : doc
      )
    )
  }

  const handleRetryDocument = (id: string) => {
    setDocumentos(prev =>
      prev.map(doc =>
        doc.id === id
          ? { ...doc, status: 'pendente' }
          : doc
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Gestão de Documentos</span>
          </CardTitle>
          <CardDescription>
            Gerencie recibos, declarações e outros documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar Documento</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Título ou paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="todos">Todos os tipos</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="enviado">Enviado</option>
                <option value="visualizado">Visualizado</option>
                <option value="erro">Erro</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowNewDocument(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold text-gray-900">{documentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'pendente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.dataEnvio === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Com Erro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'erro').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>
            {filteredDocumentos.length} documento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocumentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              filteredDocumentos.map((documento) => {
                const TipoIcon = getTipoIcon(documento.tipo)
                const StatusIcon = getStatusIcon(documento.status)
                const FormaEnvioIcon = formasEnvio.find(f => f.value === documento.formaEnvio)?.icon || Mail

                return (
                  <div key={documento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TipoIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{documento.titulo}</h3>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                              {getTipoLabel(documento.tipo)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mt-1">
                            <User className="inline h-4 w-4 mr-1" />
                            {documento.paciente.nome}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Gerado em: {new Date(documento.dataGeracao).toLocaleDateString('pt-BR')}
                            </span>
                            {documento.dataEnvio && (
                              <span className="flex items-center">
                                <Send className="h-3 w-3 mr-1" />
                                Enviado em: {new Date(documento.dataEnvio).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            <span className="flex items-center">
                              <FormaEnvioIcon className="h-3 w-3 mr-1" />
                              {formasEnvio.find(f => f.value === documento.formaEnvio)?.label}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            Para: {documento.destinatario}
                          </div>
                          
                          {documento.consulta && (
                            <div className="text-xs text-green-600 mt-1">
                              Consulta: {documento.consulta.medico} - R$ {documento.consulta.valor.toFixed(2)}
                            </div>
                          )}
                          
                          {documento.observacoes && (
                            <div className="text-xs text-orange-600 mt-1">
                              {documento.observacoes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(documento.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{getStatusLabel(documento.status)}</span>
                        </span>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                          
                          {documento.status === 'pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendDocument(documento.id)}
                              title="Enviar"
                            >
                              <Send className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          
                          {documento.status === 'erro' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetryDocument(documento.id)}
                              title="Tentar novamente"
                            >
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Novo Documento */}
      {showNewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Novo Documento</CardTitle>
              <CardDescription>
                Gere um novo documento para envio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                  <select
                    id="tipoDocumento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="pacienteNome">Paciente</Label>
                  <Input
                    id="pacienteNome"
                    placeholder="Nome do paciente"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="titulo">Título do Documento</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Recibo de Consulta - Cardiologia"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medicoResponsavel">Médico Responsável</Label>
                  <select
                    id="medicoResponsavel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione o médico</option>
                    <option value="dr-joao">Dr. João Santos</option>
                    <option value="dra-maria">Dra. Maria Lima</option>
                    <option value="dr-carlos">Dr. Carlos Mendes</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="dataConsulta">Data da Consulta</Label>
                  <Input
                    id="dataConsulta"
                    type="date"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorConsulta">Valor (R$)</Label>
                  <Input
                    id="valorConsulta"
                    type="number"
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="formaEnvioDoc">Forma de Envio</Label>
                  <select
                    id="formaEnvioDoc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione</option>
                    {formasEnvio.map(forma => (
                      <option key={forma.value} value={forma.value}>{forma.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="destinatarioDoc">Destinatário</Label>
                <Input
                  id="destinatarioDoc"
                  placeholder="E-mail ou telefone do paciente"
                />
              </div>
              
              <div>
                <Label htmlFor="observacoesDoc">Observações</Label>
                <textarea
                  id="observacoesDoc"
                  placeholder="Observações adicionais..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="anexo">Anexar Arquivo (opcional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar um arquivo ou arraste aqui
                  </p>
                  <input
                    type="file"
                    id="anexo"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Documento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewDocument(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
