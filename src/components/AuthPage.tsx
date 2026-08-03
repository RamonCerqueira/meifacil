'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  User, 
  Building, 
  Mail, 
  Lock, 
  Loader2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Calculator,
  CheckCircle2
} from 'lucide-react'
import { loginSchema, registerSchema, formatCpfCnpj } from '../lib/validations'

interface AuthPageProps {
  mode: 'login' | 'register'
  onBack: () => void
  onSuccess: () => void
}

export default function AuthPage({ mode, onBack, onSuccess }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf')
  const { theme, setTheme } = useTheme()

  const schema = mode === 'login' ? loginSchema : registerSchema
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<any>({
    resolver: zodResolver(schema)
  })

  const watchDocument = watch('cpfCnpj', '')

  const handleDocumentChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '')
    if (cleaned.length <= 11) {
      setDocumentType('cpf')
    } else {
      setDocumentType('cnpj')
    }
    const formatted = formatCpfCnpj(value)
    setValue('cpfCnpj', formatted)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      if (mode === 'login') {
        const result = await signIn('credentials', {
          cpfCnpj: data.cpfCnpj,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error('CPF/CNPJ ou senha incorretos')
        }

        if (result?.ok) {
          onSuccess()
        }
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro no registro')
        }

        const loginResult = await signIn('credentials', {
          cpfCnpj: data.cpfCnpj,
          password: data.password,
          redirect: false,
        })

        if (loginResult?.ok) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error)
      alert(error instanceof Error ? error.message : 'Erro na autenticação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Erro no login com Google:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row font-sans transition-colors duration-200">
      
      {/* PAINEL ESQUERDO (HERO BRANDING - DESKTOP & TABLET) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">MEI Fácil</span>
          </div>
          
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </button>
        </div>

        {/* Hero Central Text & Highlights */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gestão Contábil Inteligente para MEI</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black leading-tight mb-6 tracking-tight">
            Descomplique suas finanças e cuide do seu{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              CNPJ MEI
            </span>.
          </h1>

          <p className="text-slate-300 text-base lg:text-lg mb-8 leading-relaxed">
            Controle o teto de R$ 81 mil, emita recibos em PDF, acompanhe sua isenção de IRPF e fique em dia com a Receita Federal sem estresse.
          </p>

          {/* Cards de Recursos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Termômetro R$ 81k</h4>
                <p className="text-xs text-slate-300">Monitore o teto proporcional</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Lucro Isento IRPF</h4>
                <p className="text-xs text-slate-300">Cálculo de 32%, 8% e 16%</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Recibos em PDF</h4>
                <p className="text-xs text-slate-300">Gere recibos com sua logo</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">DAS & Trava 80%</h4>
                <p className="text-xs text-slate-300">Conformidade fiscal total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} MEI Fácil - Sistema Contábil</span>
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Segurança SSL & LGPD protegida</span>
          </span>
        </div>
      </div>

      {/* PAINEL DIREITO (FORMULÁRIO MODERNO) */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Toggle Theme Button Top Right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 shadow-xs"
            title="Alternar Tema Claro/Escuro"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>

        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Header Form Titles */}
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {mode === 'login' 
                ? 'Insira seus dados de acesso para entrar no sistema' 
                : 'Preencha os campos abaixo para cadastrar seu MEI'
              }
            </p>
          </div>

          {/* Social Google Login Option */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-all shadow-xs flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Entrar com o Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-slate-50 dark:bg-slate-950 px-3 text-xs uppercase text-slate-400 font-semibold tracking-wider absolute">
                Ou continue com CPF/CNPJ
              </span>
            </div>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Nome (Apenas Registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome completo ou razão social
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Seu nome ou Razão Social"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-xs"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>
                )}
              </div>
            )}

            {/* Email (Apenas Registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.email.message)}</p>
                )}
              </div>
            )}

            {/* CPF / CNPJ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                CPF ou CNPJ
              </label>
              <div className="relative">
                {documentType === 'cpf' ? (
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <Building className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
                <input
                  {...register('cpfCnpj')}
                  type="text"
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={watchDocument}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  className="w-full pl-11 pr-16 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium shadow-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {documentType}
                </span>
              </div>
              {errors.cpfCnpj && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.cpfCnpj.message)}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha secreta"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.password.message)}</p>
              )}
            </div>

            {/* Confirmar Senha (Apenas Registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita sua senha"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.confirmPassword.message)}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Entrar no Sistema' : 'Cadastrar MEI Grátis'}</span>
              )}
            </button>
          </form>

          {/* Toggle Login/Register footer text */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
            {mode === 'login' ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ainda não tem conta?{' '}
                <a
                  href="/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Cadastre-se gratuitamente
                </a>
              </p>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Já possui cadastro?{' '}
                <a
                  href="/login"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Faça login aqui
                </a>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
