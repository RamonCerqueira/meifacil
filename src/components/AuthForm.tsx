import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '@/lib/validations'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isLogin = mode === 'login'
  const schema = isLogin ? loginSchema : registerSchema
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginInput | RegisterInput) => {
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Mock login - em produção seria integrado com NextAuth
        console.log('Login attempt:', data)
        // Simular sucesso
        router.push('/')
      } else {
        // Mock register - em produção seria integrado com a API
        const registerData = data as RegisterInput
        console.log('Register attempt:', registerData)
        // Simular sucesso
        router.push('/')
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Mock Google sign in - em produção seria integrado com NextAuth
    console.log('Google sign in attempt')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MEI Fácil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              Entrar com Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <div>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{String(errors.name.message)}</p>
                  )}
                </div>
              )}

              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="E-mail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Senha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.password.message)}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Confirmar senha"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{String(errors.confirmPassword.message)}</p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push(isLogin ? '/register' : '/login')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

