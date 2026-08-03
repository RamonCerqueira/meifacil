'use client'

import { useSession }  from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthPage from '@/components/AuthPage'

export default function RegisterPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <AuthPage 
      mode="register" 
      onBack={() => router.push('/')}
      onSuccess={() => router.push('/')}
    />
  )
}

