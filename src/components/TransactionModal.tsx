'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Receipt, TrendingUp, TrendingDown, Calendar, Building2, User } from 'lucide-react'

interface Client {
  id: string
  name: string
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialType?: 'INCOME' | 'EXPENSE'
  initialClientId?: string
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'INCOME',
  initialClientId = '',
}: TransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [businessSector, setBusinessSector] = useState<'SERVICE' | 'COMMERCE' | 'INDUSTRY' | 'TRANSPORT'>('SERVICE')
  const [clientId, setClientId] = useState(initialClientId)
  const [clients, setClients] = useState<Client[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      setClientId(initialClientId)
      fetchClients()
    }
  }, [isOpen, initialType, initialClientId])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Informe uma descrição e um valor válido maior que zero.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          description: description.trim(),
          date: new Date(date),
          category: 'Geral',
          businessSector: type === 'INCOME' ? businessSector : undefined,
          clientId: clientId || undefined,
        }),
      })

      if (res.ok) {
        setDescription('')
        setAmount('')
        setClientId('')
        onSuccess()
        onClose()
      } else {
        const d = await res.json()
        setError(d.error || 'Erro ao salvar transação.')
      }
    } catch (err) {
      console.error('Erro ao submeter transação:', err)
      setError('Erro de conexão ao salvar transação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Nova Transação (Livro Caixa)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Registre uma entrada de receita ou saída de despesa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Receita (Entrada)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Despesa (Saída)</span>
            </button>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              placeholder="Ex: Serviço prestado, Compra de materiais..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Valor R$ e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Data do Lançamento</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Setor Fiscal (Apenas se Receita) */}
          {type === 'INCOME' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Setor Fiscal (Presunção IRPF)</span>
              </label>
              <select
                value={businessSector}
                onChange={(e) => setBusinessSector(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              >
                <option value="SERVICE">Serviços (ISS — 32% Isenção IRPF)</option>
                <option value="COMMERCE">Comércio (ICMS — 8% Isenção IRPF)</option>
                <option value="INDUSTRY">Indústria (ICMS — 8% Isenção IRPF)</option>
                <option value="TRANSPORT">Transporte (16% Isenção IRPF)</option>
              </select>
            </div>
          )}

          {/* Cliente Opcional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Vincular Cliente (Opcional)</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="">Nenhum cliente selecionado</option>
              {clients.map((cli) => (
                <option key={cli.id} value={cli.id}>{cli.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center space-x-2 disabled:opacity-60 ${
                type === 'INCOME'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Transação'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
