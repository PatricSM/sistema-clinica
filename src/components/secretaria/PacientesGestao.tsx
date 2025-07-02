'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react'

interface Paciente {
  id: string
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  telefone: string
  email: string
  endereco: {
    cep: string
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  dadosMedicos: {
    convenio?: string
    numeroCarteirinha?: string
    alergias?: string[]
    medicamentos?: string[]
    observacoes?: string
  }
  emergencia: {
    nomeContato: string
    telefone: string
    parentesco: string
  }
  dataCadastro: string
  ultimaConsulta?: string
  status: 'ativo' | 'inativo'
}

export function PacientesGestao() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)

  // Dados de exemplo
  const [pacientes, setPacientes] = useState<Paciente[]>([
    {
      id: '1',
      nome: 'Ana Maria Costa',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1985-03-15',
      telefone: '(11) 99999-1111',
      email: 'ana@email.com',
      endereco: {
        cep: '01234-567',
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      dadosMedicos: {
        convenio: 'Amil',
        numeroCarteirinha: '123456789',
        alergias: ['Penicilina'],
        medicamentos: ['Losartana 50mg'],
        observacoes: 'Hipertensa controlada'
      },
      emergencia: {
        nomeContato: 'João Costa',
        telefone: '(11) 99999-2222',
        parentesco: 'Esposo'
      },
      dataCadastro: '2024-01-15',
      ultimaConsulta: '2024-06-20',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Pedro Silva Santos',
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      dataNascimento: '1992-08-22',
      telefone: '(11) 99999-3333',
      email: 'pedro@email.com',
      endereco: {
        cep: '09876-543',
        rua: 'Av. Paulista',
        numero: '456',
        complemento: 'Apto 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      dadosMedicos: {
        convenio: 'Bradesco Saúde',
        numeroCarteirinha: '987654321',
        observacoes: 'Paciente jovem, sem comorbidades'
      },
      emergencia: {
        nomeContato: 'Maria Silva',
        telefone: '(11) 99999-4444',
        parentesco: 'Mãe'
      },
      dataCadastro: '2024-02-10',
      ultimaConsulta: '2024-06-25',
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Lucia Santos Oliveira',
      cpf: '456.789.123-00',
      rg: '45.678.912-3',
      dataNascimento: '1978-12-03',
      telefone: '(11) 99999-5555',
      email: 'lucia@email.com',
      endereco: {
        cep: '12345-678',
        rua: 'Rua Augusta',
        numero: '789',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      dadosMedicos: {
        alergias: ['Dipirona', 'Ácido Acetilsalicílico'],
        medicamentos: ['Metformina 850mg', 'Insulina NPH'],
        observacoes: 'Diabética tipo 2'
      },
      emergencia: {
        nomeContato: 'Carlos Oliveira',
        telefone: '(11) 99999-6666',
        parentesco: 'Filho'
      },
      dataCadastro: '2024-03-05',
      status: 'ativo'
    }
  ])

  const filteredPacientes = pacientes.filter(paciente => {
    const matchesSearch = paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paciente.cpf.includes(searchTerm) ||
                         paciente.telefone.includes(searchTerm) ||
                         paciente.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || paciente.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleViewPatient = (paciente: Paciente) => {
    setSelectedPatient(paciente)
    setShowPatientDetails(true)
  }

  const handleEditPatient = (paciente: Paciente) => {
    setSelectedPatient(paciente)
    setShowNewPatient(true)
  }

  const handleDeletePatient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      setPacientes(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Gestão de Pacientes</span>
          </CardTitle>
          <CardDescription>
            Cadastre e gerencie todos os pacientes da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar Paciente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, CPF, telefone ou e-mail..."
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => {
                setSelectedPatient(null)
                setShowNewPatient(true)
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Paciente
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
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{pacientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Novos este Mês</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Com Alergias</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{pacientes.filter(p => p.status === 'ativo').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {filteredPacientes.length} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPacientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum paciente encontrado</p>
              </div>
            ) : (
              filteredPacientes.map((paciente) => (
                <div key={paciente.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{paciente.nome}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            paciente.status === 'ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {paciente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                          {paciente.dadosMedicos.alergias && paciente.dadosMedicos.alergias.length > 0 && (
                            <div title="Possui alergias">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{calculateAge(paciente.dataNascimento)} anos • </span>
                          <span>CPF: {paciente.cpf} • </span>
                          <span>{paciente.telefone}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Cadastrado em: {new Date(paciente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                          {paciente.ultimaConsulta && (
                            <span> • Última consulta: {new Date(paciente.ultimaConsulta).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                        
                        {paciente.dadosMedicos.convenio && (
                          <div className="text-xs text-blue-600 mt-1">
                            Convênio: {paciente.dadosMedicos.convenio}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPatient(paciente)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ligar"
                      >
                        <Phone className="h-4 w-4 text-green-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Enviar e-mail"
                      >
                        <Mail className="h-4 w-4 text-purple-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPatient(paciente)}
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(paciente.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Paciente */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Paciente</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPatientDetails(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Nome:</strong> {selectedPatient.nome}
                  </div>
                  <div>
                    <strong>Idade:</strong> {calculateAge(selectedPatient.dataNascimento)} anos
                  </div>
                  <div>
                    <strong>CPF:</strong> {selectedPatient.cpf}
                  </div>
                  <div>
                    <strong>RG:</strong> {selectedPatient.rg}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {selectedPatient.telefone}
                  </div>
                  <div>
                    <strong>E-mail:</strong> {selectedPatient.email}
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Endereço</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedPatient.endereco.rua}, {selectedPatient.endereco.numero} {selectedPatient.endereco.complemento && `- ${selectedPatient.endereco.complemento}`}</p>
                  <p>{selectedPatient.endereco.bairro} - {selectedPatient.endereco.cidade}/{selectedPatient.endereco.estado}</p>
                  <p>CEP: {selectedPatient.endereco.cep}</p>
                </div>
              </div>

              {/* Dados Médicos */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Dados Médicos</h3>
                <div className="space-y-2 text-sm">
                  {selectedPatient.dadosMedicos.convenio && (
                    <div>
                      <strong>Convênio:</strong> {selectedPatient.dadosMedicos.convenio}
                      {selectedPatient.dadosMedicos.numeroCarteirinha && ` - Carteirinha: ${selectedPatient.dadosMedicos.numeroCarteirinha}`}
                    </div>
                  )}
                  
                  {selectedPatient.dadosMedicos.alergias && selectedPatient.dadosMedicos.alergias.length > 0 && (
                    <div>
                      <strong>Alergias:</strong> {selectedPatient.dadosMedicos.alergias.join(', ')}
                    </div>
                  )}
                  
                  {selectedPatient.dadosMedicos.medicamentos && selectedPatient.dadosMedicos.medicamentos.length > 0 && (
                    <div>
                      <strong>Medicamentos:</strong> {selectedPatient.dadosMedicos.medicamentos.join(', ')}
                    </div>
                  )}
                  
                  {selectedPatient.dadosMedicos.observacoes && (
                    <div>
                      <strong>Observações:</strong> {selectedPatient.dadosMedicos.observacoes}
                    </div>
                  )}
                </div>
              </div>

              {/* Contato de Emergência */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contato de Emergência</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> {selectedPatient.emergencia.nomeContato}</p>
                  <p><strong>Telefone:</strong> {selectedPatient.emergencia.telefone}</p>
                  <p><strong>Parentesco:</strong> {selectedPatient.emergencia.parentesco}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => handleEditPatient(selectedPatient)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowPatientDetails(false)}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showNewPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </CardTitle>
              <CardDescription>
                {selectedPatient ? 'Edite os dados do paciente' : 'Cadastre um novo paciente no sistema'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input 
                      id="nome" 
                      placeholder="Digite o nome completo"
                      defaultValue={selectedPatient?.nome}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input 
                      id="dataNascimento" 
                      type="date"
                      defaultValue={selectedPatient?.dataNascimento}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00"
                      defaultValue={selectedPatient?.cpf}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg">RG</Label>
                    <Input 
                      id="rg" 
                      placeholder="00.000.000-0"
                      defaultValue={selectedPatient?.rg}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      placeholder="(11) 99999-9999"
                      defaultValue={selectedPatient?.telefone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@exemplo.com"
                      defaultValue={selectedPatient?.email}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input 
                      id="cep" 
                      placeholder="00000-000"
                      defaultValue={selectedPatient?.endereco.cep}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input 
                      id="rua" 
                      placeholder="Nome da rua"
                      defaultValue={selectedPatient?.endereco.rua}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input 
                      id="numero" 
                      placeholder="123"
                      defaultValue={selectedPatient?.endereco.numero}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input 
                      id="complemento" 
                      placeholder="Apto 101"
                      defaultValue={selectedPatient?.endereco.complemento}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input 
                      id="bairro" 
                      placeholder="Nome do bairro"
                      defaultValue={selectedPatient?.endereco.bairro}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                      id="cidade" 
                      placeholder="Nome da cidade"
                      defaultValue={selectedPatient?.endereco.cidade}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input 
                      id="estado" 
                      placeholder="SP"
                      defaultValue={selectedPatient?.endereco.estado}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Médicos */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Dados Médicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="convenio">Convênio</Label>
                    <Input 
                      id="convenio" 
                      placeholder="Nome do convênio"
                      defaultValue={selectedPatient?.dadosMedicos.convenio}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carteirinha">Número da Carteirinha</Label>
                    <Input 
                      id="carteirinha" 
                      placeholder="000000000"
                      defaultValue={selectedPatient?.dadosMedicos.numeroCarteirinha}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alergias">Alergias</Label>
                    <Input 
                      id="alergias" 
                      placeholder="Ex: Penicilina, Dipirona (separadas por vírgula)"
                      defaultValue={selectedPatient?.dadosMedicos.alergias?.join(', ')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                    <Input 
                      id="medicamentos" 
                      placeholder="Ex: Losartana 50mg, Metformina 850mg (separados por vírgula)"
                      defaultValue={selectedPatient?.dadosMedicos.medicamentos?.join(', ')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="observacoesMedicas">Observações Médicas</Label>
                    <textarea
                      id="observacoesMedicas"
                      placeholder="Observações médicas relevantes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      defaultValue={selectedPatient?.dadosMedicos.observacoes}
                    />
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Contato de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nomeEmergencia">Nome do Contato</Label>
                    <Input 
                      id="nomeEmergencia" 
                      placeholder="Nome completo"
                      defaultValue={selectedPatient?.emergencia.nomeContato}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefoneEmergencia">Telefone</Label>
                    <Input 
                      id="telefoneEmergencia" 
                      placeholder="(11) 99999-9999"
                      defaultValue={selectedPatient?.emergencia.telefone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentesco">Parentesco</Label>
                    <Input 
                      id="parentesco" 
                      placeholder="Ex: Esposo, Filho, Mãe"
                      defaultValue={selectedPatient?.emergencia.parentesco}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-6">
                <Button className="flex-1">
                  {selectedPatient ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewPatient(false)
                    setSelectedPatient(null)
                  }}
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
