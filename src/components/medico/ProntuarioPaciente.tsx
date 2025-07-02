'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Edit,
  Plus,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Heart
} from 'lucide-react'
import { PatientMoodView } from './PatientMoodView'
import { PatientQuestionnaires } from './PatientQuestionnaires'

interface PacienteInfo {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
}

interface Sessao {
  id: string
  data: string
  duracao: string
  tipo: string
  observacoes: string
  diagnostico?: string
  medicamentos?: string
  proximos_passos?: string
}

interface ProntuarioPacienteProps {
  pacienteId: string
  onBack: () => void
}

export function ProntuarioPaciente({ pacienteId, onBack }: ProntuarioPacienteProps) {
  const [paciente, setPaciente] = useState<PacienteInfo | null>(null)
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'sessoes' | 'humor' | 'questionarios' | 'historico'>('info')

  useEffect(() => {
    const loadProntuario = async () => {
      setIsLoading(true)
      
      // Dados de exemplo baseados no ID
      const dadosPaciente: PacienteInfo = {
        id: pacienteId,
        name: pacienteId === '1' ? 'Ana Carolina Silva' : 
              pacienteId === '2' ? 'Pedro Santos Oliveira' : 
              'Maria José Costa',
        email: pacienteId === '1' ? 'ana.silva@email.com' : 
               pacienteId === '2' ? 'pedro.santos@email.com' : 
               'maria.costa@email.com',
        phone: '(11) 99999-1111',
        date_of_birth: pacienteId === '1' ? '1985-03-15' : 
                       pacienteId === '2' ? '1990-07-22' : 
                       '1978-11-30',
        gender: pacienteId === '2' ? 'Masculino' : 'Feminino',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        emergency_contact: 'João Silva (marido)',
        emergency_phone: '(11) 98888-2222'
      }

      const sessoesExemplo: Sessao[] = [
        {
          id: '1',
          data: '2024-01-08',
          duracao: '50 min',
          tipo: 'Consulta de Retorno',
          observacoes: 'Paciente relatou melhora significativa nos sintomas de ansiedade. Está seguindo corretamente o tratamento medicamentoso. Demonstrou maior controle emocional e estratégias de enfrentamento mais eficazes.',
          diagnostico: 'F41.1 - Transtorno de Ansiedade Generalizada',
          medicamentos: 'Sertralina 50mg - 1x ao dia (manhã)',
          proximos_passos: 'Continuar medicação. Retorno em 15 dias.'
        },
        {
          id: '2',
          data: '2024-01-22',
          duracao: '50 min',
          tipo: 'Terapia Cognitivo-Comportamental',
          observacoes: 'Trabalhamos técnicas de respiração e reestruturação cognitiva. Paciente conseguiu identificar pensamentos automáticos negativos e aplicar questionamento socrático.',
          proximos_passos: 'Praticar exercícios de mindfulness em casa. Continuar diário de pensamentos.'
        },
        {
          id: '3',
          data: '2023-12-25',
          duracao: '50 min',
          tipo: 'Avaliação Inicial',
          observacoes: 'Primeira consulta. Paciente apresenta sintomas de ansiedade há 6 meses, relacionados a mudanças no trabalho. Histórico familiar de transtornos de humor.',
          diagnostico: 'Investigação de F41.1',
          proximos_passos: 'Aplicar escalas de avaliação. Iniciar psicoterapia.'
        }
      ]

      setPaciente(dadosPaciente)
      setSessoes(sessoesExemplo)
      setIsLoading(false)
    }

    loadProntuario()
  }, [pacienteId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Prontuário não encontrado.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prontuário - {paciente.name}</h1>
            <p className="text-gray-600">
              {calculateAge(paciente.date_of_birth)} anos • {paciente.gender}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar Dados
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'info', label: 'Informações Pessoais', icon: User },
            { id: 'sessoes', label: 'Sessões', icon: FileText },
            { id: 'humor', label: 'Humor', icon: Heart },
            { id: 'questionarios', label: 'Questionários', icon: FileText },
            { id: 'historico', label: 'Histórico Médico', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-sm text-gray-900">{paciente.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(paciente.date_of_birth)} ({calculateAge(paciente.date_of_birth)} anos)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gênero</label>
                  <p className="text-sm text-gray-900">{paciente.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                    {paciente.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                    {paciente.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Endereço</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {paciente.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato de Emergência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nome</label>
                <p className="text-sm text-gray-900">{paciente.emergency_contact}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {paciente.emergency_phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'sessoes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Sessões Registradas</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </div>

          <div className="space-y-4">
            {sessoes.map((sessao) => (
              <Card key={sessao.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{sessao.tipo}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {formatDate(sessao.data)} • {sessao.duracao}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {sessao.observacoes}
                    </p>
                  </div>
                  
                  {sessao.diagnostico && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                      <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded border border-blue-200">
                        {sessao.diagnostico}
                      </p>
                    </div>
                  )}
                  
                  {sessao.medicamentos && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos</label>
                      <p className="text-sm text-gray-900 bg-green-50 p-2 rounded border border-green-200">
                        {sessao.medicamentos}
                      </p>
                    </div>
                  )}
                  
                  {sessao.proximos_passos && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Próximos Passos</label>
                      <p className="text-sm text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {sessao.proximos_passos}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'humor' && (
        <PatientMoodView patientId={pacienteId} />
      )}

      {activeTab === 'questionarios' && (
        <PatientQuestionnaires patientId={pacienteId} />
      )}

      {activeTab === 'historico' && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Informações Importantes</span>
                </div>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Histórico familiar de transtornos de humor</li>
                  <li>• Primeira crise de ansiedade aos 30 anos</li>
                  <li>• Alergia a penicilina</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Medicamentos Atuais</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-900">Sertralina 50mg - 1x ao dia (manhã)</p>
                  <p className="text-xs text-gray-500 mt-1">Prescristo em: 25/12/2023</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exames Complementares</h4>
                <p className="text-sm text-gray-500">Nenhum exame registrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 