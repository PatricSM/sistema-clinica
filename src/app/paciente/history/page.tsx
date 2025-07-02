'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { supabase } from '@/lib/supabase';
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface HistoryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'missed';
  professional_name?: string;
  type?: string;
}

export default function HistoryPage() {
  const { user } = useCustomAuth();
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatientId();
    }
  }, [user]);

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  const fetchPatientId = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPatientId(data.id);
    } catch (error) {
      console.error('Erro ao buscar patient_id:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Buscar consultas do paciente
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          professionals!inner(
            users!inner(
              full_name
            )
          )
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Transformar dados para o formato esperado
      const entries: HistoryEntry[] = appointments?.map(apt => ({
        id: apt.id.toString(),
        date: apt.start_time,
        title: `Consulta com ${(apt.professionals as any)?.users?.full_name || 'Profissional'}`,
        description: apt.notes || `Consulta - ${new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        status: apt.status === 'completed' ? 'completed' : 
                apt.status === 'cancelled' || apt.status === 'no_show' ? 'missed' : 'pending',
        professional_name: (apt.professionals as any)?.users?.full_name || 'Profissional'
      })) || [];

      setHistoryEntries(entries);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Consultas</h1>
          <p className="text-gray-600">Veja o histórico completo de suas consultas e exames</p>
        </div>

        {historyEntries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
            <p className="text-gray-500">Você ainda não possui consultas registradas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status === 'completed' ? 'Concluído' : entry.status === 'pending' ? 'Pendente' : 'Faltou'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
