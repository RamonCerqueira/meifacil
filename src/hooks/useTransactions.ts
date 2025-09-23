import { useState, useEffect } from 'react'
import { TransactionInput } from '@/lib/validations'

export interface Transaction extends TransactionInput {
  id: string
  createdAt: string
  updatedAt: string
}

// Mock data para desenvolvimento
const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'RECEITA',
    description: 'Venda de consultoria para João Silva',
    amount: 150.00,
    date: '2024-01-25',
    clientId: '1',
    serviceId: 's1',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 't2',
    type: 'DESPESA',
    description: 'Compra de material de escritório',
    amount: 50.00,
    date: '2024-01-26',
    createdAt: '2024-01-26T11:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
]

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular carregamento inicial
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setTransactions(mockTransactions)
      setIsLoading(false)
    }, 500)
  }, [])

  const createTransaction = async (data: TransactionInput): Promise<Transaction> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newTransaction: Transaction = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTransactions(prev => [...prev, newTransaction])
      return newTransaction
    } catch (err) {
      const errorMessage = 'Erro ao criar transação'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = async (id: string, data: TransactionInput): Promise<Transaction> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedTransaction: Transaction = {
        ...data,
        id,
        createdAt: transactions.find(t => t.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updatedTransaction : transaction
      ))
      
      return updatedTransaction
    } catch (err) {
      const errorMessage = 'Erro ao atualizar transação'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTransaction = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
    } catch (err) {
      const errorMessage = 'Erro ao deletar transação'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

