'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Building, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { formatCpfCnpj } from '@/lib/validations'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialName?: string
}

export default function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  initialName = '',
}: ClientModalProps) {
  const [name, setName] = useState(initialName)
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
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
    if (!name.trim()) {
      setError('Informe o Nome ou Razão Social do cliente.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          cpfCnpj: cpfCnpj ? cpfCnpj.replace(/\D/g, '') : undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        }),
      })

      if (res.ok) {
        setName('')
        setCpfCnpj('')
        setEmail('')
        setPhone('')
        setAddress('')
        onSuccess()
        onClose()
      } else {
        const d = await res.json()
        setError(d.error || d.message || 'Erro ao cadastrar cliente.')
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      setError('Erro de conexão ao salvar cliente.')
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Cadastrar Novo Cliente</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Informe os dados do tomador de serviço ou cliente</p>
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
          
          {/* Nome / Razão Social */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nome / Razão Social *
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva ou Empresa XYZ"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* CPF ou CNPJ + E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>CPF ou CNPJ</span>
              </label>
              <input
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Telefone + Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span>Telefone / WhatsApp</span>
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Endereço</span>
              </label>
              <input
                type="text"
                placeholder="Rua, número, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
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
              <span>{submitting ? 'Salvando...' : 'Cadastrar Cliente'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
