'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalPatients: number;
  averageTicket: number;
  paymentsToday: number;
}

interface Transaction {
  id: number;
  patient_name: string;
  professional_name: string;
  amount: number;
  transaction_date: string;
  payment_method: string;
  status: string;
  notes?: string;
}

interface PaymentMethod {
  method: string;
  count: number;
  total: number;
}

export default function FinancialDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalPatients: 0,
    averageTicket: 0,
    paymentsToday: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const supabase = createClient();

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Calcular datas baseado no período selecionado
      const now = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (selectedPeriod === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Buscar transações com dados dos pacientes e profissionais
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          patients!financial_transactions_patient_id_fkey (
            users!patients_user_id_fkey (full_name)
          ),
          professionals!financial_transactions_professional_id_fkey (
            users!professionals_user_id_fkey (full_name)
          )
        `)
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Processar dados das transações
      const transactions = (transactionsData || []).map((t: any) => ({
        id: t.id,
        patient_name: t.patients?.users?.full_name || 'N/A',
        professional_name: t.professionals?.users?.full_name || 'N/A',
        amount: parseFloat(t.amount),
        transaction_date: t.transaction_date,
        payment_method: t.payment_method,
        status: t.status,
        notes: t.notes
      }));

      // Calcular métricas
      const totalRevenue = transactions
        .filter((t: Transaction) => t.status === 'paid')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const pendingPayments = transactions
        .filter((t: Transaction) => t.status === 'pending')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const today = new Date().toISOString().split('T')[0];
      const paymentsToday = transactions
        .filter((t: Transaction) => t.status === 'paid' && t.transaction_date.startsWith(today))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      // Buscar total de pacientes únicos
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id');

      if (patientsError) throw patientsError;

      const totalPatients = patientsData?.length || 0;
      const averageTicket = totalPatients > 0 ? totalRevenue / totalPatients : 0;

      // Agrupar por método de pagamento
      const methodsMap = new Map<string, {count: number, total: number}>();
      
      transactions.filter((t: Transaction) => t.status === 'paid').forEach((t: Transaction) => {
        const current = methodsMap.get(t.payment_method) || {count: 0, total: 0};
        methodsMap.set(t.payment_method, {
          count: current.count + 1,
          total: current.total + t.amount
        });
      });

      const paymentMethodsArray = Array.from(methodsMap.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total
      }));

      setMetrics({
        totalRevenue,
        monthlyRevenue: totalRevenue,
        pendingPayments,
        totalPatients,
        averageTicket,
        paymentsToday
      });

      setRecentTransactions(transactions.slice(0, 10));
      setPaymentMethods(paymentMethodsArray);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      bank_transfer: 'Transferência',
      boleto: 'Boleto'
    };
    return labels[method] || method;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="year">Último Ano</option>
          </select>
          
          <Button 
            onClick={loadFinancialData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Receita Total</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Pagamentos Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingPayments)}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Recebido Hoje</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.paymentsToday)}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Total de Pacientes</div>
          <div className="text-2xl font-bold text-gray-900">{metrics.totalPatients}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Ticket Médio</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.averageTicket)}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Transações</div>
          <div className="text-2xl font-bold text-indigo-600">{recentTransactions.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métodos de Pagamento */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h2>
          
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{getPaymentMethodLabel(method.method)}</div>
                    <div className="text-sm text-gray-500">{method.count} transações</div>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(method.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Transações Recentes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h2>
          
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{transaction.patient_name}</div>
                    <div className="text-sm text-gray-500">
                      {transaction.professional_name} • {formatDate(transaction.transaction_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getPaymentMethodLabel(transaction.payment_method)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Resumo do Período */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo do Período ({selectedPeriod === 'week' ? 'Última Semana' : selectedPeriod === 'month' ? 'Último Mês' : 'Último Ano'})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-sm text-green-700">Receita Total</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingPayments)}</div>
            <div className="text-sm text-yellow-700">Pendente</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{recentTransactions.filter((t: Transaction) => t.status === 'paid').length}</div>
            <div className="text-sm text-blue-700">Pagamentos Realizados</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.averageTicket)}</div>
            <div className="text-sm text-purple-700">Ticket Médio</div>
          </div>
        </div>
      </Card>
    </div>
  );
} 