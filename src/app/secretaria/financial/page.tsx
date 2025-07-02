'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { CurrencyDollarIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Transaction {
  id: number
  patient_name: string
  description: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'overdue'
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer'
}

export default function SecretaryFinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          id,
          amount,
          transaction_date,
          payment_method,
          status,
          notes,
          patients!inner(
            id,
            users!inner(
              full_name
            )
          )
        `)
        .order('transaction_date', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao buscar transações:', error)
        return
      }

      const transformedTransactions: Transaction[] = data.map((transaction: any) => ({
        id: transaction.id,
        patient_name: transaction.patients.users.full_name,
        description: `Consulta - ${new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}`,
        amount: parseFloat(transaction.amount),
        date: transaction.transaction_date,
        status: (transaction.status === 'paid' ? 'paid' : transaction.status === 'pending' ? 'pending' : 'overdue') as 'paid' | 'pending' | 'overdue',
        payment_method: transaction.payment_method
      }))

      setTransactions(transformedTransactions)
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || t.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
    paid: transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0),
    pending: transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0),
    overdue: transactions.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0),
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Controle Financeiro
            </h1>
            <p className="text-gray-600">
              Gerencie transações e pagamentos dos pacientes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total)}</div>
              <div className="text-sm text-gray-600">Total Arrecadado</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</div>
              <div className="text-sm text-green-600">Pago</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</div>
              <div className="text-sm text-yellow-600">Pendente</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue)}</div>
              <div className="text-sm text-red-600">Atrasado</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Transações Recentes ({filteredTransactions.length})
              </h2>
            </div>

            <div className="p-6">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma transação encontrada
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {transaction.description}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {transaction.patient_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
