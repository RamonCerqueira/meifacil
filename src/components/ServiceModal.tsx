'use client'

import { useState, useEffect } from 'react'
import { X, Briefcase, Tag, DollarSign, FileText, CheckCircle2 } from 'lucide-react'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialName?: string
}

export default function ServiceModal({
  isOpen,
  onClose,
  onSuccess,
  initialName = '',
}: ServiceModalProps) {
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError('')
    }
  }, [isOpen, initialName])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      setError('Informe o nome do serviço e um preço padrão válido maior que zero.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        setName('')
        setPrice('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        const d = await res.json()
        setError(d.error || d.message || 'Erro ao cadastrar serviço.')
      }
    } catch (err) {
      console.error('Erro ao salvar serviço:', err)
      setError('Erro de conexão ao salvar serviço.')
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
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Cadastrar Novo Serviço</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cadastre serviços com preços pré-definidos para agilizar recibos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nome do Serviço */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nome do Serviço *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Manutenção de Computadores, Consultoria..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Preço Padrão R$ */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              <span>Preço Padrão (R$) *</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={price}
              onChange={(e) => { setPrice(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Descrição (Opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Descrição (Opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes do que está incluso neste serviço..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
            />
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
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Cadastrar Serviço'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
