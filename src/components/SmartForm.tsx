import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Check, Loader2, Sparkles } from 'lucide-react'

interface SmartFormProps {
  type: 'receita' | 'despesa' | 'cliente'
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  clients?: any[]
  services?: any[]
}

const receitaSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória')
})

const despesaSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória')
})

const clienteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().optional()
})

export default function SmartForm({ type, isOpen, onClose, onSubmit, clients = [], services = [] }: SmartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const getSchema = () => {
    switch (type) {
      case 'receita': return receitaSchema
      case 'despesa': return despesaSchema
      case 'cliente': return clienteSchema
      default: return clienteSchema
    }
  }

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(getSchema())
  })

  const watchedValues = watch()

  useEffect(() => {
    if (isOpen) {
      reset()
      setStep(1)
      // Preencher data atual automaticamente
      if (type === 'receita' || type === 'despesa') {
        setValue('date', new Date().toISOString().split('T')[0])
      }
    }
  }, [isOpen, reset, setValue, type])

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFormTitle = () => {
    switch (type) {
      case 'receita': return '💰 Recebi um Pagamento'
      case 'despesa': return '💸 Fiz uma Despesa'
      case 'cliente': return '👤 Novo Cliente'
      default: return 'Formulário'
    }
  }

  const getQuickSuggestions = () => {
    if (type === 'receita') {
      return [
        'Pagamento de serviço',
        'Venda de produto',
        'Consultoria',
        'Freelance'
      ]
    }
    if (type === 'despesa') {
      return [
        'Material de trabalho',
        'Combustível',
        'Internet',
        'Aluguel'
      ]
    }
    return []
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              {getFormTitle()}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            Preencha os dados de forma rápida e simples
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Sugestões rápidas para descrição */}
          {(type === 'receita' || type === 'despesa') && step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O que aconteceu?
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {getQuickSuggestions().map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setValue('description', suggestion)}
                    className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <input
                {...register('description')}
                placeholder="Ou digite sua própria descrição..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          )}

          {/* Campo de valor */}
          {(type === 'receita' || type === 'despesa') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual foi o valor?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-medium"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
          )}

          {/* Seleção de cliente (apenas para receitas) */}
          {type === 'receita' && clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                De qual cliente? (opcional)
              </label>
              <select
                {...register('clientId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Seleção de serviço (apenas para receitas) */}
          {type === 'receita' && services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual serviço? (opcional)
              </label>
              <select
                {...register('serviceId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data */}
          {(type === 'receita' || type === 'despesa') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quando foi?
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
          )}

          {/* Campos do cliente */}
          {type === 'cliente' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do cliente
                </label>
                <input
                  {...register('name')}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (opcional)
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="joao@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  {...register('phone')}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

