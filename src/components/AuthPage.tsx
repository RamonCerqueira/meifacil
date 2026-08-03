import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, ArrowLeft, User, Building, Mail, Lock, Loader2 } from 'lucide-react'
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
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf')

  const schema = mode === 'login' ? loginSchema : registerSchema
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<any>({
    resolver: zodResolver(schema)
  })

  const watchDocument = watch('cpfCnpj', '')

  // Auto-detectar tipo de documento e aplicar máscara
  const handleDocumentChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '')
    
    if (cleaned.length <= 11) {
      setDocumentType('cpf')
    } else {
      setDocumentType('cnpj')
    }
    
    // Usar a função de formatação centralizada
    const formatted = formatCpfCnpj(value)
    setValue('cpfCnpj', formatted)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      if (mode === 'login') {
        // Usar NextAuth para login
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
        // Registro via API
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

        const result = await response.json()
        console.log('Registro realizado com sucesso:', result)
        
        // Após registro bem-sucedido, fazer login automaticamente
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            MEI Fácil
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Acesse sua conta com CPF ou CNPJ' 
              : 'Cadastre-se e comece a organizar suas finanças'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome (apenas no registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo ou razão social
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Seu nome ou nome da empresa"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
                )}
              </div>
            )}

            {/* Email (apenas no registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
                )}
              </div>
            )}

            {/* CPF/CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF ou CNPJ
              </label>
              <div className="relative">
                {documentType === 'cpf' ? (
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  {...register('cpfCnpj')}
                  type="text"
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={watchDocument}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    documentType === 'cpf' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {documentType.toUpperCase()}
                  </span>
                </div>
              </div>
              {errors.cpfCnpj && (
                <p className="text-red-500 text-sm mt-1">{String(errors.cpfCnpj.message)}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
              )}
            </div>

            {/* Confirmar senha (apenas no registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.confirmPassword.message)}</p>
                )}
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                mode === 'login' ? 'Entrar' : 'Criar conta'
              )}
            </button>

            {/* Link para alternar modo */}
            <div className="text-center">
              <p className="text-gray-600">
                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  type="button"
                  onClick={() => window.location.href = mode === 'login' ? '/register' : '/login'}
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                >
                  {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Informações de segurança */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Seus dados estão protegidos com criptografia de nível bancário
          </p>
        </div>
      </div>
    </div>
  )
}

