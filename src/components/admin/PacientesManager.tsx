'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { PacientesList } from './PacientesList'
import { PacienteForm, PacienteFormData } from './PacienteForm'
import { PacienteView } from './PacienteView'
import type { Paciente } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

interface PacientesManagerProps {
  className?: string
}

export function PacientesManager({ className }: PacientesManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useCustomAuth()
  const supabase = createClient()

  // Handlers para navegação
  const handleCreateNew = () => {
    setSelectedPaciente(null)
    setViewMode('create')
  }

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setViewMode('edit')
  }

  const handleView = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setViewMode('view')
  }

  const handleBackToList = () => {
    setSelectedPaciente(null)
    setViewMode('list')
  }

  const handleEditFromView = () => {
    if (selectedPaciente) {
      setViewMode('edit')
    }
  }

  // Handler para salvar (criar/editar)
  const handleSave = async (formData: PacienteFormData) => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      if (viewMode === 'create') {
        // Criar novo usuário
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            role: 'patient',
            is_active: true,
            email_verified: false
          })
          .select('id')
          .single()

        if (userError) throw userError

        // Criar registro de paciente
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: newUser.id,
            cpf: formData.cpf,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            rg: formData.rg,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            status: 'active'
          })

        if (patientError) throw patientError

        console.log('Paciente criado com sucesso!')
      } else if (selectedPaciente) {
        // Atualizar usuário existente
        const { error: userError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          })
          .eq('id', selectedPaciente.id)

        if (userError) throw userError

        // Atualizar dados do paciente
        const { error: patientError } = await supabase
          .from('patients')
          .update({
            cpf: formData.cpf,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            rg: formData.rg,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone
          })
          .eq('user_id', selectedPaciente.id)

        if (patientError) throw patientError

        console.log('Paciente atualizado com sucesso!')
      }
      
      // Voltar para a lista
      handleBackToList()
      
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
      alert('Erro ao salvar paciente. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler para exclusão/inativação
  const handleDelete = async (paciente: Paciente) => {
    const confirmed = confirm(
      `Tem certeza que deseja ${paciente.is_active ? 'inativar' : 'ativar'} o paciente ${paciente.full_name}?`
    )
    
    if (!confirmed) return
    
    try {
      // Atualizar status do usuário
      const { error } = await supabase
        .from('users')
        .update({ is_active: !paciente.is_active })
        .eq('id', paciente.id)

      if (error) throw error

      console.log('Status do paciente alterado com sucesso!')
      
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error)
      alert('Erro ao alterar status do paciente. Tente novamente.')
    }
  }

  // Renderização condicional baseada no modo de visualização
  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <PacienteForm
            onSave={handleSave}
            onCancel={handleBackToList}
            isLoading={isLoading}
          />
        )
      
      case 'edit':
        return (
          <PacienteForm
            paciente={selectedPaciente}
            onSave={handleSave}
            onCancel={handleBackToList}
            isLoading={isLoading}
          />
        )
      
      case 'view':
        return selectedPaciente ? (
          <PacienteView
            paciente={selectedPaciente}
            onEdit={handleEditFromView}
            onClose={handleBackToList}
          />
        ) : null
      
      case 'list':
      default:
        return (
          <PacientesList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        )
    }
  }

  return (
    <div className={className}>
      {renderContent()}
    </div>
  )
} 