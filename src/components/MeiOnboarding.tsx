'use client'

import { useState } from 'react'
import { Shield, Building2, Briefcase, Calendar, Check, ChevronRight, Info, X } from 'lucide-react'

interface MeiOnboardingProps {
  onComplete: () => void
}

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo ao MEI Fácil', icon: Shield },
  { id: 'document', title: 'Seu CPF ou CNPJ', icon: Building2 },
  { id: 'sector', title: 'Atividade Principal', icon: Briefcase },
  { id: 'opening', title: 'Data de Abertura / Início', icon: Calendar },
]

export default function MeiOnboarding({ onComplete }: MeiOnboardingProps) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [cpfCnpj, setCpfCnpj] = useState('')
  const [sector, setSector] = useState('SERVICE')
  const [openingDate, setOpeningDate] = useState('')

  const formatCpfCnpj = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  const handleNext = () => {
    const clean = cpfCnpj.replace(/\D/g, '')
    if (step === 1 && clean.length !== 11 && clean.length !== 14) {
      setError('Informe um CPF válido (11 dígitos) ou CNPJ (14 dígitos).')
      return
    }
    if (step === 3) {
      handleFinish()
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  const handleFinish = async () => {
    try {
      setSaving(true)
      setError('')
      const clean = cpfCnpj.replace(/\D/g, '')
      const res = await fetch('/api/user/issuer-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpfCnpj: clean,
          defaultSector: sector,
          openingDate: openingDate || null,
        }),
      })
      if (res.ok) {
        onComplete()
      } else {
        const d = await res.json()
        setError(d.error || 'Erro ao salvar. Tente novamente.')
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet.')
    } finally {
      setSaving(false)
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden relative">

        {/* Botão para Pular / Fechar opcional para não travar o usuário */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          title="Fechar e configurar mais tarde"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center space-x-2 px-6 pt-5 pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                i < step
                  ? 'bg-emerald-500 text-white'
                  : i === step
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-6 min-h-[300px] flex flex-col justify-center">

          {step === 0 && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Olá! Seja bem-vindo ao MEI Fácil 🎉</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Para personalizar seu controle financeiro, impostos e relatórios, informe seu <strong>CPF</strong> ou <strong>CNPJ MEI</strong>.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { emoji: '📄', label: 'Suporte a CPF e CNPJ MEI' },
                  { emoji: '📊', label: 'Teto e faturamento sob controle' },
                  { emoji: '🛡️', label: 'Conformidade e emissão de recibos' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
                    <p className="text-lg mb-1">{item.emoji}</p>
                    <p className="font-bold text-indigo-800 dark:text-indigo-300 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Informe seu CPF ou CNPJ</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Atendemos Autônomos (CPF) e MEIs (CNPJ). Digite os números abaixo:
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  CPF (11 dígitos) ou CNPJ (14 dígitos) *
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => { setCpfCnpj(formatCpfCnpj(e.target.value)); setError('') }}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center text-lg tracking-wider"
                />
                {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Você pode usar o sistema tanto como Pessoa Física (CPF) quanto como Pessoa Jurídica (CNPJ MEI).
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Qual sua atividade principal?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Usado para categorizar suas receitas e cálculos contábeis.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'SERVICE', label: 'Prestação de Serviços', das: 'R$ 75,60', detail: 'Prestador de serviços / Profissional liberal', color: 'indigo' },
                  { value: 'COMMERCE', label: 'Comércio / Revenda', das: 'R$ 71,60', detail: 'Venda de produtos e mercadorias', color: 'emerald' },
                  { value: 'INDUSTRY', label: 'Indústria / Fabricação', das: 'R$ 71,60', detail: 'Produção ou transformação de bens', color: 'amber' },
                  { value: 'TRANSPORT', label: 'Transporte (Caminhoneiro / Driver)', das: 'R$ 174,44', detail: 'Transporte de cargas ou passageiros', color: 'purple' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSector(opt.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      sector === opt.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{opt.detail}</p>
                    </div>
                    {sector === opt.value && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-auto mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Data de Abertura / Início
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  A data de abertura do seu CNPJ MEI ou início das atividades.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data de abertura (opcional)</label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={(e) => setOpeningDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300 flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Tudo pronto! Você poderá alterar estas informações a qualquer momento em <strong>Meu CNPJ MEI / Perfil</strong>.
                </span>
              </div>
              {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : undefined}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-0 transition-all"
          >
            Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-2"
          >
            <span>{saving ? 'Salvando...' : step === STEPS.length - 1 ? 'Concluir e Entrar' : 'Continuar'}</span>
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
