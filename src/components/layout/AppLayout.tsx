'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import type { UserRole } from '@/types'

interface AppLayoutProps {
  children: ReactNode
  currentUserType: UserRole
  onUserTypeChange: (type: UserRole) => void
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-72">
        <main className="flex-1">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
