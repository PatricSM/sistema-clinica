'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { DocumentViewer } from '@/components/paciente/DocumentViewer'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

export default function DocumentsPage() {
  const { user } = useCustomAuth()

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-600">Visualize e baixe seus documentos e relatórios</p>
        </div>
        
        <DocumentViewer />
      </div>
    </MainLayout>
  )
}
