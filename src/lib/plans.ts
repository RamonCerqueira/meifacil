export type PlanType = 'FREE' | 'PRO'

export interface PlanLimits {
  maxClients: number
  maxServices: number
  maxTransactions: number
  maxReceipts: number
  canExportPDF: boolean
  canUseAdvancedReports: boolean
  hasEmailSupport: boolean
  hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    maxClients: 5,
    maxServices: 3,
    maxTransactions: 10,
    maxReceipts: 5,
    canExportPDF: true,
    canUseAdvancedReports: false,
    hasEmailSupport: false,
    hasPrioritySupport: false,
  },
  PRO: {
    maxClients: Infinity,
    maxServices: Infinity,
    maxTransactions: Infinity,
    maxReceipts: Infinity,
    canExportPDF: true,
    canUseAdvancedReports: true,
    hasEmailSupport: true,
    hasPrioritySupport: true,
  },
}

export const PLAN_PRICES = {
  FREE: 0,
  PRO: 29.90,
}

export function checkFeatureAccess(
  userPlan: PlanType,
  feature: keyof PlanLimits
): boolean {
  return PLAN_LIMITS[userPlan][feature] as boolean
}

export function checkLimitAccess(
  userPlan: PlanType,
  feature: keyof PlanLimits,
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[userPlan][feature] as number
  return currentCount < limit
}

export function getRemainingLimit(
  userPlan: PlanType,
  feature: keyof PlanLimits,
  currentCount: number
): number {
  const limit = PLAN_LIMITS[userPlan][feature] as number
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - currentCount)
}

export function getPlanFeatures(plan: PlanType): string[] {
  const limits = PLAN_LIMITS[plan]
  const features: string[] = []

  if (limits.maxClients === Infinity) {
    features.push('Clientes ilimitados')
  } else {
    features.push(`Até ${limits.maxClients} clientes`)
  }

  if (limits.maxServices === Infinity) {
    features.push('Serviços ilimitados')
  } else {
    features.push(`Até ${limits.maxServices} serviços`)
  }

  if (limits.maxTransactions === Infinity) {
    features.push('Transações ilimitadas')
  } else {
    features.push(`Até ${limits.maxTransactions} transações/mês`)
  }

  if (limits.maxReceipts === Infinity) {
    features.push('Recibos ilimitados')
  } else {
    features.push(`Até ${limits.maxReceipts} recibos/mês`)
  }

  if (limits.canExportPDF) {
    features.push('Exportação em PDF')
  }

  if (limits.canUseAdvancedReports) {
    features.push('Relatórios avançados')
  }

  if (limits.hasEmailSupport) {
    features.push('Suporte por email')
  }

  if (limits.hasPrioritySupport) {
    features.push('Suporte prioritário')
  }

  return features
}

