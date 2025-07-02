'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  X, 
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Consulta, AppointmentStatus } from '@/types'

interface ConsultaFormProps {
  consulta?: Consulta | null
  initialDate?: Date
  initialTime?: string
  onSave: (data: ConsultaFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export interface ConsultaFormData {
  patient_id: number
  professional_id: number
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string
  duration?: number
}

// Mock data para demonstração
const mockPacientes = [
  { id: 1, name: 'Ana Silva Costa', phone: '(11) 98765-4321' },
  { id: 2, name: 'Carlos Eduardo Santos', phone: '(11) 97654-3210' },
  { id: 3, name: 'Mariana Oliveira Lima', phone: '(11) 96543-2109' },
  { id: 4, name: 'Roberto Ferreira Souza', phone: '(11) 95432-1098' },
  { id: 5, name: 'Julia Mendes Silva', phone: '(11) 94321-0987' },
  { id: 6, name: 'Pedro Henrique Costa', phone: '(11) 93210-9876' }
]

const mockProfissionais = [
  { id: 2, name: 'Dra. Maria Santos', specialty: 'Psicologia Clínica', color: '#3B82F6' },
  { id: 3, name: 'Dr. João Costa', specialty: 'Neuropsicologia', color: '#10B981' },
  { id: 4, name: 'Dra. Ana Rodrigues', specialty: 'Psicologia Infantil', color: '#F59E0B' },
  { id: 5, name: 'Dr. Carlos Mendes', specialty: 'Terapia Cognitiva', color: '#8B5CF6' }
]

const horariosPadrao = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

const duracoesPadrao = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 50, label: '50 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' }
]

export function ConsultaForm({ 
  consulta, 
  initialDate, 
  initialTime, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ConsultaFormProps) {
  const [formData, setFormData] = useState<ConsultaFormData>({
    patient_id: 0,
    professional_id: 0,
    start_time: '',
    end_time: '',
    status: 'scheduled',
    notes: '',
    duration: 50
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchPaciente, setSearchPaciente] = useState('')
  const [showPacientesList, setShowPacientesList] = useState(false)

  // Carregar dados da consulta para edição
  useEffect(() => {
    if (consulta) {
      setFormData({
        patient_id: consulta.patient_id,
        professional_id: consulta.professional_id,
        start_time: formatDateTimeForInput(consulta.start_time),
        end_time: formatDateTimeForInput(consulta.end_time),
        status: consulta.status,
        notes: consulta.notes || '',
        duration: calculateDuration(consulta.start_time, consulta.end_time)
      })
    } else if (initialDate) {
      // Configurar data e hora inicial para nova consulta
      const dateStr = initialDate.toISOString().split('T')[0]
      const timeStr = initialTime || '09:00'
      const startDateTime = `${dateStr}T${timeStr}`
      
      setFormData(prev => ({
        ...prev,
        start_time: startDateTime,
        end_time: calculateEndTime(startDateTime, prev.duration || 50)
      }))
    }
  }, [consulta, initialDate, initialTime])

  // Atualizar end_time quando duration ou start_time mudam
  useEffect(() => {
    if (formData.start_time && formData.duration) {
      setFormData(prev => ({
        ...prev,
        end_time: calculateEndTime(prev.start_time, prev.duration || 50)
      }))
    }
  }, [formData.start_time, formData.duration])

  // Funções utilitárias
  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime) return ''
    
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    
    return formatDateTimeForInput(end.toISOString())
  }

  // Validação de formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patient_id) {
      newErrors.patient_id = 'Selecione um paciente'
    }

    if (!formData.professional_id) {
      newErrors.professional_id = 'Selecione um profissional'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Data e hora são obrigatórias'
    } else {
      const startDate = new Date(formData.start_time)
      const now = new Date()
      
      if (startDate < now && !consulta) {
        newErrors.start_time = 'Não é possível agendar no passado'
      }
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duração mínima de 15 minutos'
    }

    // Validar conflitos de horário (simulado)
    if (formData.start_time && formData.professional_id && !consulta) {
      // TODO: Implementar verificação real de conflitos
      const isWeekend = new Date(formData.start_time).getDay() === 0 || new Date(formData.start_time).getDay() === 6
      if (isWeekend) {
        newErrors.start_time = 'Agendamentos não disponíveis aos finais de semana'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: keyof ConsultaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Converter para UTC para salvamento
      const submitData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      }
      
      onSave(submitData)
    }
  }

  const handleSelectPaciente = (paciente: typeof mockPacientes[0]) => {
    handleInputChange('patient_id', paciente.id)
    setSearchPaciente(paciente.name)
    setShowPacientesList(false)
  }

  const filteredPacientes = mockPacientes.filter(p =>
    p.name.toLowerCase().includes(searchPaciente.toLowerCase())
  )

  const selectedPaciente = mockPacientes.find(p => p.id === formData.patient_id)
  const selectedProfissional = mockProfissionais.find(p => p.id === formData.professional_id)

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {consulta ? 'Editar Consulta' : 'Nova Consulta'}
            </h2>
            <p className="text-gray-600">
              {consulta ? 'Atualize os dados da consulta' : 'Agende uma nova consulta'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : consulta ? 'Atualizar' : 'Agendar'}
            </Button>
          </div>
        </div>

        {/* Seleção de Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Paciente
            </CardTitle>
            <CardDescription>
              Selecione o paciente para a consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar paciente por nome..."
                  value={selectedPaciente ? selectedPaciente.name : searchPaciente}
                  onChange={(e) => {
                    setSearchPaciente(e.target.value)
                    setShowPacientesList(true)
                    if (formData.patient_id) {
                      handleInputChange('patient_id', 0)
                    }
                  }}
                  onFocus={() => setShowPacientesList(true)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.patient_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                
                {showPacientesList && searchPaciente && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPacientes.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPacientes.map(paciente => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => handleSelectPaciente(paciente)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{paciente.name}</div>
                          <div className="text-sm text-gray-500">{paciente.phone}</div>
                        </button>
                      ))
                    )}
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 border-t border-gray-200"
                      onClick={() => {
                        // TODO: Abrir formulário de novo paciente
                        alert('Funcionalidade de novo paciente será implementada')
                      }}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Cadastrar novo paciente
                    </button>
                  </div>
                )}
              </div>
              
              {selectedPaciente && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedPaciente.name}</span>
                  </div>
                  <div className="text-sm text-blue-700 mt-1">{selectedPaciente.phone}</div>
                </div>
              )}
              
              {errors.patient_id && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.patient_id}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profissional e Data/Hora */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={formData.professional_id}
                onChange={(e) => handleInputChange('professional_id', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.professional_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um profissional</option>
                {mockProfissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} - {prof.specialty}
                  </option>
                ))}
              </select>
              
              {selectedProfissional && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{selectedProfissional.specialty}</div>
                </div>
              )}
              
              {errors.professional_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.professional_id}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Data e Hora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Data e Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora de Início
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.start_time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.start_time}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {duracoesPadrao.map(duracao => (
                    <option key={duracao.value} value={duracao.value}>
                      {duracao.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.end_time && (
                <div className="p-2 bg-green-50 rounded text-sm">
                  <strong>Término:</strong> {new Date(formData.end_time).toLocaleString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status e Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Detalhes da Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Agendada</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">Faltou</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Observações sobre a consulta (opcional)..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Salvando...' : consulta ? 'Atualizar Consulta' : 'Agendar Consulta'}
          </Button>
        </div>
      </form>
    </div>
  )
} 