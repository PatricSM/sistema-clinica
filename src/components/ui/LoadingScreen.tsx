'use client'

import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Carregando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {/* Logo ou ícone */}
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        </div>
        
        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema Clínica
          </h1>
          <p className="text-gray-600">
            {message}
          </p>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"
              style={{
                animation: 'loading-bar 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        
        <style jsx>{`
          @keyframes loading-bar {
            0%, 100% { 
              transform: translateX(-100%); 
              opacity: 0.6;
            }
            50% { 
              transform: translateX(0%); 
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  )
} 