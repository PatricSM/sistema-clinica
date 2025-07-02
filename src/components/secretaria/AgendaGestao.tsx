'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Phone,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Agendamento {
  id: string
  data: string
  horario: string
  paciente: {
    nome: string
    telefone: string
    email: string
  }
  medico: string
  especialidade: string
  tipo: 'consulta' | 'retorno' | 'avaliacao' | 'exame'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'reagendado' | 'realizado'
  observacoes?: string
  valor?: number
}

export function AgendaGestao() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showNewAppointment, setShowNewAppointment] = useState(false)

  // Dados de exemplo
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    {
      id: '1',
      data: '2024-07-01',
      horario: '08:00',
      paciente: {
        nome: 'Ana Maria Costa',
        telefone: '(11) 99999-1111',
        email: 'ana@email.com'
      },
      medico: 'Dr. João Santos',
      especialidade: 'Cardiologia',
      tipo: 'consulta',
      status: 'confirmado',
      valor: 200
    },
    {
      id: '2',
      data: '2024-07-01',
      horario: '09:00',
      paciente: {
        nome: 'Pedro Silva',
        telefone: '(11) 99999-2222',
        email: 'pedro@email.com'
      },
      medico: 'Dra. Maria Lima',
      especialidade: 'Dermatologia',
      tipo: 'retorno',
      status: 'agendado',
      valor: 150
    },
    {
      id: '3',
      data: '2024-07-01',
      horario: '10:00',
      paciente: {
        nome: 'Lucia Santos',
        telefone: '(11) 99999-3333',
        email: 'lucia@email.com'
      },
      medico: 'Dr. João Santos',
      especialidade: 'Cardiologia',
      tipo: 'avaliacao',
      status: 'confirmado',
      valor: 250
    }
  ])

  const medicos = [
    'Dr. João Santos - Cardiologia',
    'Dra. Maria Lima - Dermatologia',
    'Dr. Carlos Mendes - Ortopedia',
    'Dra. Ana Paula - Ginecologia'
  ]

  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesDate = agendamento.data === selectedDate
    const matchesSearch = agendamento.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agendamento.medico.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || agendamento.status === statusFilter

    return matchesDate && matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'agendado':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      case 'reagendado':
        return 'bg-blue-100 text-blue-800'
      case 'realizado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado'
      case 'agendado':
        return 'Agendado'
      case 'cancelado':
        return 'Cancelado'
      case 'reagendado':
        return 'Reagendado'
      case 'realizado':
        return 'Realizado'
      default:
        return status
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return 'Consulta'
      case 'retorno':
        return 'Retorno'
      case 'avaliacao':
        return 'Avaliação'
      case 'exame':
        return 'Exame'
      default:
        return tipo
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setAgendamentos(prev => 
      prev.map(agendamento => 
        agendamento.id === id 
          ? { ...agendamento, status: newStatus as any }
          : agendamento
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Gestão de Agenda</span>
          </CardTitle>
          <CardDescription>
            Gerencie todos os agendamentos e consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Paciente ou médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="reagendado">Reagendado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowNewAppointment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
          <CardDescription>
            {filteredAgendamentos.length} agendamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAgendamentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum agendamento encontrado para esta data</p>
              </div>
            ) : (
              filteredAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {agendamento.horario}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTipoLabel(agendamento.tipo)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {agendamento.paciente.nome}
                        </div>
                        <div className="text-sm text-gray-600">
                          {agendamento.medico} • {agendamento.especialidade}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {agendamento.paciente.telefone} • {agendamento.paciente.email}
                        </div>
                        {agendamento.valor && (
                          <div className="text-sm font-medium text-green-600 mt-1">
                            R$ {agendamento.valor.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                        {getStatusLabel(agendamento.status)}
                      </span>
                      
                      <div className="flex space-x-1">
                        {agendamento.status === 'agendado' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(agendamento.id, 'confirmado')}
                              title="Confirmar"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ligar para paciente"
                            >
                              <Phone className="h-4 w-4 text-blue-600" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Reagendar"
                        >
                          <RefreshCw className="h-4 w-4 text-yellow-600" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4 text-gray-600" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(agendamento.id, 'cancelado')}
                          title="Cancelar"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {agendamento.observacoes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <strong>Observações:</strong> {agendamento.observacoes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Novo Agendamento */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Novo Agendamento</CardTitle>
              <CardDescription>
                Cadastre um novo agendamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paciente">Nome do Paciente</Label>
                <Input id="paciente" placeholder="Digite o nome do paciente" />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(11) 99999-9999" />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
              
              <div>
                <Label htmlFor="medico">Médico</Label>
                <select id="medico" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione o médico</option>
                  {medicos.map((medico, index) => (
                    <option key={index} value={medico}>{medico}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data-agendamento">Data</Label>
                  <Input id="data-agendamento" type="date" />
                </div>
                <div>
                  <Label htmlFor="horario-agendamento">Horário</Label>
                  <select id="horario-agendamento" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione</option>
                    {horarios.map((horario) => (
                      <option key={horario} value={horario}>{horario}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tipo-consulta">Tipo de Consulta</Label>
                <select id="tipo-consulta" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione o tipo</option>
                  <option value="consulta">Consulta</option>
                  <option value="retorno">Retorno</option>
                  <option value="avaliacao">Avaliação</option>
                  <option value="exame">Exame</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input id="valor" type="number" placeholder="0,00" />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">
                  Agendar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewAppointment(false)}
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
