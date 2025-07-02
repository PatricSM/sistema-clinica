'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ArrowDownTrayIcon as DownloadIcon 
} from '@heroicons/react/24/outline';

export default function AdminReportsPage() {
  const reports = [
    {
      id: 1,
      title: 'Relatório Financeiro Mensal',
      description: 'Resumo completo das receitas e despesas do mês',
      icon: CreditCardIcon,
      color: 'bg-green-100 text-green-700',
      lastGenerated: '2025-01-02',
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'Relatório de Consultas',
      description: 'Estatísticas de consultas realizadas e agendadas',
      icon: CalendarIcon,
      color: 'bg-blue-100 text-blue-700',
      lastGenerated: '2025-01-01',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Relatório de Pacientes',
      description: 'Cadastros, ativos e histórico de pacientes',
      icon: UsersIcon,
      color: 'bg-purple-100 text-purple-700',
      lastGenerated: '2024-12-30',
      size: '3.1 MB'
    },
    {
      id: 4,
      title: 'Relatório Operacional',
      description: 'Indicadores de performance da clínica',
      icon: ChartBarIcon,
      color: 'bg-orange-100 text-orange-700',
      lastGenerated: '2024-12-28',
      size: '1.5 MB'
    }
  ];

  const generateReport = (reportId: number) => {
    alert(`Gerando relatório ${reportId}... Você receberá uma notificação quando estiver pronto.`);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Gere e baixe relatórios detalhados sobre a operação da clínica
          </p>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DownloadIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">1,342</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendados</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de relatórios */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Relatórios Disponíveis</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {reports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${report.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Último: {report.lastGenerated}</span>
                          <span>•</span>
                          <span>Tamanho: {report.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Baixar
                      </button>
                      <button 
                        onClick={() => generateReport(report.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Gerar Novo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Agendar Relatório</span>
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium">Relatório Personalizado</span>
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium">Histórico Completo</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
