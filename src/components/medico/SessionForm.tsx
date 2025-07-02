'use client'

import { useState, useEffect } from 'react'
import { Save, X, Search, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

interface Diagnosis {
  id: number
  code: string
  description: string
  type: 'CID-10' | 'DSM-5'
}

interface SessionFormData {
  record_date: string
  session_notes: string
  observations: string
  selectedDiagnoses: number[]
}

interface SessionFormProps {
  patientId: number
  patientName: string
  onSubmit: () => void
  onCancel: () => void
  initialData?: SessionFormData
  isEditing?: boolean
  recordId?: number
}

export function SessionForm({ 
  patientId, 
  patientName, 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false,
  recordId
}: SessionFormProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    record_date: initialData?.record_date || new Date().toISOString().split('T')[0],
    session_notes: initialData?.session_notes || '',
    observations: initialData?.observations || '',
    selectedDiagnoses: initialData?.selectedDiagnoses || []
  })

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [diagnosisSearch, setDiagnosisSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SessionFormData>>({})

  const { user } = useCustomAuth()
  const supabase = createClient()

  useEffect(() => {
    loadDiagnoses()
  }, [])

  const loadDiagnoses = async () => {
    try {
      const { data: diagnosesData, error } = await supabase
        .from('diagnoses')
        .select('*')
        .order('type', { ascending: true })
        .order('code', { ascending: true })

      if (error) {
        console.error('Erro ao carregar diagnósticos:', error)
        return
      }

      setDiagnoses(diagnosesData || [])
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SessionFormData> = {}

    if (!formData.record_date) {
      newErrors.record_date = 'Data da sessão é obrigatória'
    }

    if (!formData.session_notes.trim()) {
      newErrors.session_notes = 'Anotações da sessão são obrigatórias'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      if (isEditing && recordId) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('medical_records')
          .update({
            record_date: formData.record_date,
            session_notes: formData.session_notes,
            observations: formData.observations,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId)

        if (updateError) {
          console.error('Erro ao atualizar sessão:', updateError)
          return
        }
      } else {
        // Criar novo registro
        const { data: recordData, error: insertError } = await supabase
          .from('medical_records')
          .insert([{
            patient_id: patientId,
            professional_id: user?.id,
            record_date: formData.record_date,
            session_notes: formData.session_notes,
            observations: formData.observations
          }])
          .select()
          .single()

        if (insertError) {
          console.error('Erro ao criar sessão:', insertError)
          return
        }

        // Associar diagnósticos se houver
        if (formData.selectedDiagnoses.length > 0 && recordData) {
          const diagnosisRecords = formData.selectedDiagnoses.map(diagnosisId => ({
            medical_record_id: recordData.id,
            diagnosis_id: diagnosisId
          }))

          const { error: diagnosisError } = await supabase
            .from('medical_record_diagnoses')
            .insert(diagnosisRecords)

          if (diagnosisError) {
            console.error('Erro ao associar diagnósticos:', diagnosisError)
          }
        }
      }

      onSubmit()
    } catch (error) {
      console.error('Erro geral ao salvar sessão:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SessionFormData, value: string | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const addDiagnosis = (diagnosis: Diagnosis) => {
    if (!formData.selectedDiagnoses.includes(diagnosis.id)) {
      handleInputChange('selectedDiagnoses', [...formData.selectedDiagnoses, diagnosis.id])
    }
    setDiagnosisSearch('')
  }

  const removeDiagnosis = (diagnosisId: number) => {
    handleInputChange('selectedDiagnoses', formData.selectedDiagnoses.filter(id => id !== diagnosisId))
  }

  const filteredDiagnoses = diagnoses.filter(d => 
    diagnosisSearch === '' || 
    d.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
    d.description.toLowerCase().includes(diagnosisSearch.toLowerCase())
  )

  const selectedDiagnosesData = diagnoses.filter(d => formData.selectedDiagnoses.includes(d.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Sessão' : 'Nova Sessão'} - {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data da Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Sessão *
            </label>
            <input
              type="date"
              value={formData.record_date}
              onChange={(e) => handleInputChange('record_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.record_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.record_date && (
              <p className="text-red-500 text-xs mt-1">{errors.record_date}</p>
            )}
          </div>

          {/* Anotações da Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anotações da Sessão *
            </label>
            <textarea
              value={formData.session_notes}
              onChange={(e) => handleInputChange('session_notes', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.session_notes ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={6}
              placeholder="Descreva o que aconteceu na sessão, evolução do paciente, técnicas utilizadas..."
            />
            {errors.session_notes && (
              <p className="text-red-500 text-xs mt-1">{errors.session_notes}</p>
            )}
          </div>

          {/* Observações Clínicas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações Clínicas
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Observações adicionais, sintomas observados, recomendações..."
            />
          </div>

          {/* Diagnósticos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnósticos (CID-10 / DSM-5)
            </label>
            
            {/* Diagnósticos Selecionados */}
            {selectedDiagnosesData.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Diagnósticos selecionados:</p>
                <div className="space-y-2">
                  {selectedDiagnosesData.map(diagnosis => (
                    <div 
                      key={diagnosis.id}
                      className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                    >
                      <div>
                        <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded mr-2">
                          {diagnosis.code}
                        </span>
                        <span className="text-sm">{diagnosis.description}</span>
                        <span className="text-xs text-gray-500 ml-2">({diagnosis.type})</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeDiagnosis(diagnosis.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Busca de Diagnósticos */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={diagnosisSearch}
                onChange={(e) => setDiagnosisSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar diagnóstico por código ou descrição..."
              />
            </div>

            {/* Lista de Diagnósticos para Seleção */}
            {diagnosisSearch && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredDiagnoses.slice(0, 10).map(diagnosis => (
                  <div
                    key={diagnosis.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => addDiagnosis(diagnosis)}
                  >
                    <div className="flex items-center">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-2">
                        {diagnosis.code}
                      </span>
                      <span className="text-sm flex-1">{diagnosis.description}</span>
                      <span className="text-xs text-gray-500">({diagnosis.type})</span>
                    </div>
                  </div>
                ))}
                {filteredDiagnoses.length === 0 && (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Nenhum diagnóstico encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Sessão' : 'Salvar Sessão')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 