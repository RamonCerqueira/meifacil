import { useState, useEffect } from 'react'
import { ServiceInput } from '@/lib/validations'

export interface Service extends ServiceInput {
  id: string
  createdAt: string
  updatedAt: string
}

// Mock data para desenvolvimento
const mockServices: Service[] = [
  {
    id: 's1',
    name: 'Consultoria Financeira',
    description: 'Serviço de consultoria para MEIs e pequenos negócios.',
    price: 150.00,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 's2',
    name: 'Desenvolvimento de Website',
    description: 'Criação de websites responsivos e otimizados.',
    price: 1200.00,
    createdAt: '2024-01-22T11:30:00Z',
    updatedAt: '2024-01-22T11:30:00Z',
  },
]

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular carregamento inicial
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setServices(mockServices)
      setIsLoading(false)
    }, 500)
  }, [])

  const createService = async (data: ServiceInput): Promise<Service> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newService: Service = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setServices(prev => [...prev, newService])
      return newService
    } catch (err) {
      const errorMessage = 'Erro ao criar serviço'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateService = async (id: string, data: ServiceInput): Promise<Service> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedService: Service = {
        ...data,
        id,
        createdAt: services.find(s => s.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ))
      
      return updatedService
    } catch (err) {
      const errorMessage = 'Erro ao atualizar serviço'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteService = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setServices(prev => prev.filter(service => service.id !== id))
    } catch (err) {
      const errorMessage = 'Erro ao deletar serviço'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
  }
}

