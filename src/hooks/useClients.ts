import { useState, useEffect } from 'react'
import { ClientInput } from '@/lib/validations'

export interface Client extends ClientInput {
  id: string
  createdAt: string
  updatedAt: string
}

// Mock data para desenvolvimento
const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    cpfCnpj: '123.456.789-00',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    cpfCnpj: '987.654.321-00',
    phone: '(11) 88888-8888',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
]

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular carregamento inicial
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setClients(mockClients)
      setIsLoading(false)
    }, 500)
  }, [])

  const createClient = async (data: ClientInput): Promise<Client> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newClient: Client = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setClients(prev => [...prev, newClient])
      return newClient
    } catch (err) {
      const errorMessage = 'Erro ao criar cliente'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateClient = async (id: string, data: ClientInput): Promise<Client> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedClient: Client = {
        ...data,
        id,
        createdAt: clients.find(c => c.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ))
      
      return updatedClient
    } catch (err) {
      const errorMessage = 'Erro ao atualizar cliente'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteClient = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setClients(prev => prev.filter(client => client.id !== id))
    } catch (err) {
      const errorMessage = 'Erro ao deletar cliente'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  }
}

