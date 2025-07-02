'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Payment {
  id?: number;
  patient_id: number;
  professional_id: number;
  amount: number;
  transaction_date: string;
  payment_method: string;
  transaction_type: string;
  status: string;
  notes?: string;
  patient_name?: string;
  professional_name?: string;
}

interface Patient {
  id: number;
  user_id: number;
  users: {
    full_name: string;
  };
}

interface Professional {
  id: number;
  user_id: number;
  users: {
    full_name: string;
  };
}

export default function PaymentManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_type: 'payment',
    status: 'paid',
    notes: ''
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          patients!financial_transactions_patient_id_fkey (
            id, user_id,
            users!patients_user_id_fkey (full_name)
          ),
          professionals!financial_transactions_professional_id_fkey (
            id, user_id,
            users!professionals_user_id_fkey (full_name)
          )
        `)
        .order('transaction_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      const formattedPayments = (paymentsData || []).map((p: any) => ({
        id: p.id,
        patient_id: p.patient_id,
        professional_id: p.professional_id,
        amount: parseFloat(p.amount),
        transaction_date: p.transaction_date,
        payment_method: p.payment_method,
        transaction_type: p.transaction_type,
        status: p.status,
        notes: p.notes,
        patient_name: p.patients?.users?.full_name || 'N/A',
        professional_name: p.professionals?.users?.full_name || 'N/A'
      }));

      // Carregar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          id, user_id,
          users!patients_user_id_fkey (full_name)
        `)
        .order('users(full_name)');

      if (patientsError) throw patientsError;

      // Carregar profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select(`
          id, user_id,
          users!professionals_user_id_fkey (full_name)
        `)
        .order('users(full_name)');

      if (professionalsError) throw professionalsError;

      setPayments(formattedPayments);
      setPatients(patientsData || []);
      setProfessionals(professionalsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const paymentData = {
        patient_id: parseInt(formData.patient_id),
        professional_id: parseInt(formData.professional_id),
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        payment_method: formData.payment_method,
        transaction_type: formData.transaction_type,
        status: formData.status,
        notes: formData.notes || null
      };

      if (editingPayment) {
        // Atualizar pagamento
        const { error } = await supabase
          .from('financial_transactions')
          .update(paymentData)
          .eq('id', editingPayment.id);

        if (error) throw error;
      } else {
        // Criar novo pagamento
        const { error } = await supabase
          .from('financial_transactions')
          .insert([paymentData]);

        if (error) throw error;
      }

      // Resetar formulário
      setFormData({
        patient_id: '',
        professional_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        transaction_type: 'payment',
        status: 'paid',
        notes: ''
      });

      setShowForm(false);
      setEditingPayment(null);
      loadData();

    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      alert('Erro ao salvar pagamento. Tente novamente.');
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      patient_id: payment.patient_id.toString(),
      professional_id: payment.professional_id.toString(),
      amount: payment.amount.toString(),
      transaction_date: payment.transaction_date.split('T')[0],
      payment_method: payment.payment_method,
      transaction_type: payment.transaction_type,
      status: payment.status,
      notes: payment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      alert('Erro ao excluir pagamento. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
    setFormData({
      patient_id: '',
      professional_id: '',
      amount: '',
      transaction_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      transaction_type: 'payment',
      status: 'paid',
      notes: ''
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.professional_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pagamentos</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Novo Pagamento
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por paciente, médico ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Atrasado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Formulário de Pagamento */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.users.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissional *
              </label>
              <select
                value={formData.professional_id}
                onChange={(e) => setFormData({...formData, professional_id: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um profissional</option>
                {professionals.map(professional => (
                  <option key={professional.id} value={professional.id}>
                    {professional.users.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="bank_transfer">Transferência</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="overdue">Atrasado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações sobre o pagamento..."
              />
            </div>

            {/* Botões */}
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingPayment ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de Pagamentos */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pagamentos ({filteredPayments.length})
        </h2>

        {filteredPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhum pagamento encontrado com os filtros aplicados.' 
              : 'Nenhum pagamento cadastrado.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.professional_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.transaction_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => payment.id && handleDelete(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 