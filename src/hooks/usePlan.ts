import { useState, useEffect } from 'react'
import { PlanType, checkLimitAccess, getRemainingLimit, PLAN_LIMITS } from '@/lib/plans'

interface UserPlan {
  type: PlanType
  expiresAt?: string
  isActive: boolean
}

export function usePlan() {
  const [userPlan, setUserPlan] = useState<UserPlan>({
    type: 'FREE',
    isActive: true,
  })

  // Simular carregamento do plano do usuário
  useEffect(() => {
    // Em produção, isso viria da API/banco de dados
    const savedPlan = localStorage.getItem('userPlan')
    if (savedPlan) {
      setUserPlan(JSON.parse(savedPlan))
    }
  }, [])

  const upgradeToPro = () => {
    const newPlan: UserPlan = {
      type: 'PRO',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      isActive: true,
    }
    setUserPlan(newPlan)
    localStorage.setItem('userPlan', JSON.stringify(newPlan))
  }

  const downgradeToFree = () => {
    const newPlan: UserPlan = {
      type: 'FREE',
      isActive: true,
    }
    setUserPlan(newPlan)
    localStorage.setItem('userPlan', JSON.stringify(newPlan))
  }

  const canCreateClient = (currentCount: number): boolean => {
    return checkLimitAccess(userPlan.type, 'maxClients', currentCount)
  }

  const canCreateService = (currentCount: number): boolean => {
    return checkLimitAccess(userPlan.type, 'maxServices', currentCount)
  }

  const canCreateTransaction = (currentCount: number): boolean => {
    return checkLimitAccess(userPlan.type, 'maxTransactions', currentCount)
  }

  const canGenerateReceipt = (currentCount: number): boolean => {
    return checkLimitAccess(userPlan.type, 'maxReceipts', currentCount)
  }

  const getRemainingClients = (currentCount: number): number => {
    return getRemainingLimit(userPlan.type, 'maxClients', currentCount)
  }

  const getRemainingServices = (currentCount: number): number => {
    return getRemainingLimit(userPlan.type, 'maxServices', currentCount)
  }

  const getRemainingTransactions = (currentCount: number): number => {
    return getRemainingLimit(userPlan.type, 'maxTransactions', currentCount)
  }

  const getRemainingReceipts = (currentCount: number): number => {
    return getRemainingLimit(userPlan.type, 'maxReceipts', currentCount)
  }

  const getPlanLimits = () => {
    return PLAN_LIMITS[userPlan.type]
  }

  return {
    userPlan,
    upgradeToPro,
    downgradeToFree,
    canCreateClient,
    canCreateService,
    canCreateTransaction,
    canGenerateReceipt,
    getRemainingClients,
    getRemainingServices,
    getRemainingTransactions,
    getRemainingReceipts,
    getPlanLimits,
  }
}

