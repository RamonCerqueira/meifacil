export type BusinessSector = 'SERVICE' | 'COMMERCE' | 'INDUSTRY' | 'TRANSPORT'

export const MEI_ANNUAL_LIMIT = 81000.00
export const MEI_MONTHLY_LIMIT = 6750.00

export const PROFIT_PRESUMPTION_RATES: Record<BusinessSector, number> = {
  SERVICE: 0.32,   // 32% para Prestação de Serviços
  COMMERCE: 0.08,  // 8% para Comércio e Revenda
  INDUSTRY: 0.08,  // 8% para Indústria
  TRANSPORT: 0.16, // 16% para Transporte de Passageiros
}

// Tabela oficial de valores base do DAS por categoria contábil (Salário Mínimo 2024 = R$ 1.412,00)
// INSS (5% = R$ 70,60) / ISS (R$ 5,00) / ICMS (R$ 1,00) / Caminhoneiro (12% = R$ 169,44)
export function getOfficialDasAmount(sector?: string): number {
  switch (sector) {
    case 'COMMERCE':
    case 'INDUSTRY':
      return 71.60 // R$ 70,60 INSS + R$ 1,00 ICMS
    case 'TRANSPORT':
      return 174.44 // MEI Caminhoneiro 12% INSS + ICMS/ISS
    case 'HYBRID':
      return 76.60 // R$ 70,60 INSS + R$ 1,00 ICMS + R$ 5,00 ISS
    case 'SERVICE':
    default:
      return 75.60 // R$ 70,60 INSS + R$ 5,00 ISS
  }
}

export interface TetoMEIResult {
  annualLimit: number
  grossRevenueYear: number
  remainingAmount: number
  usedPercentage: number
  monthsActive: number
  isProportional: boolean
  alertLevel: 'NORMAL' | 'WARNING' | 'EXCEEDED'
  alertMessage: string
}

export interface IrpfExemptionResult {
  totalRevenue: number
  totalExpenses: number
  exemptProfit: number
  accountingProfit: number
  taxableIncome: number
  breakdownBySector: Record<BusinessSector, { revenue: number; rate: number; exemptAmount: number }>
}

export interface PurchaseLimitResult {
  totalExpenses: number
  totalRevenue: number
  purchaseLimit: number // 80% do faturamento
  isExceeded: boolean
  usedPercentageOfRevenue: number
}

export interface DasnSummaryResult {
  serviceRevenue: number
  commerceIndustryRevenue: number
  totalRevenue: number
  hasEmployees: boolean
}

/**
 * Calcula o Teto do MEI proporcional ao ano de abertura ou teto cheio R$ 81.000,00.
 */
export function calculateProportionalLimit(openingDate?: Date | string | null, targetYear = new Date().getFullYear()): { limit: number; monthsActive: number; isProportional: boolean } {
  if (!openingDate) {
    return { limit: MEI_ANNUAL_LIMIT, monthsActive: 12, isProportional: false }
  }

  const date = new Date(openingDate)
  const openingYear = date.getFullYear()

  if (openingYear < targetYear) {
    return { limit: MEI_ANNUAL_LIMIT, monthsActive: 12, isProportional: false }
  }

  if (openingYear > targetYear) {
    return { limit: 0, monthsActive: 0, isProportional: true }
  }

  // Se abriu no ano corrente, calcula meses do mês de abertura até dezembro
  const openingMonth = date.getMonth() // 0-indexed (Jan = 0)
  const monthsActive = 12 - openingMonth
  const limit = monthsActive * MEI_MONTHLY_LIMIT

  return { limit, monthsActive, isProportional: true }
}

/**
 * Retorna o status completo do faturamento em relação ao teto do MEI.
 */
export function calculateTetoStatus(grossRevenueYear: number, openingDate?: Date | string | null, targetYear = new Date().getFullYear()): TetoMEIResult {
  const { limit: annualLimit, monthsActive, isProportional } = calculateProportionalLimit(openingDate, targetYear)
  
  const remainingAmount = Math.max(0, annualLimit - grossRevenueYear)
  const usedPercentage = annualLimit > 0 ? (grossRevenueYear / annualLimit) * 100 : 0

  let alertLevel: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL'
  let alertMessage = 'Faturamento dentro do limite com margem segura.'

  if (usedPercentage >= 100) {
    alertLevel = 'EXCEEDED'
    alertMessage = '⚠️ TETO MEI ULTRAPASSADO! Você precisa solicitar o desenquadramento do MEI para o Simples Nacional.'
  } else if (usedPercentage >= 80) {
    alertLevel = 'WARNING'
    alertMessage = '⚡ ATENÇÃO: Você já atingiu 80% ou mais do teto permitido do MEI neste ano.'
  }

  return {
    annualLimit,
    grossRevenueYear,
    remainingAmount,
    usedPercentage,
    monthsActive,
    isProportional,
    alertLevel,
    alertMessage,
  }
}

/**
 * Calcula a Parcela Isenta do IRPF e a Parcela Tributável (Lucro Isento do MEI).
 */
export function calculateIrpfExemption(
  revenueBySector: Partial<Record<BusinessSector, number>>,
  totalExpenses: number
): IrpfExemptionResult {
  const breakdownBySector: Record<BusinessSector, { revenue: number; rate: number; exemptAmount: number }> = {
    SERVICE: { revenue: revenueBySector.SERVICE || 0, rate: 0.32, exemptAmount: (revenueBySector.SERVICE || 0) * 0.32 },
    COMMERCE: { revenue: revenueBySector.COMMERCE || 0, rate: 0.08, exemptAmount: (revenueBySector.COMMERCE || 0) * 0.08 },
    INDUSTRY: { revenue: revenueBySector.INDUSTRY || 0, rate: 0.08, exemptAmount: (revenueBySector.INDUSTRY || 0) * 0.08 },
    TRANSPORT: { revenue: revenueBySector.TRANSPORT || 0, rate: 0.16, exemptAmount: (revenueBySector.TRANSPORT || 0) * 0.16 },
  }

  const totalRevenue = Object.values(breakdownBySector).reduce((acc, curr) => acc + curr.revenue, 0)
  const exemptProfit = Object.values(breakdownBySector).reduce((acc, curr) => acc + curr.exemptAmount, 0)

  // Lucro Real/Contábil do MEI = Receitas - Despesas Comprovadas
  const accountingProfit = Math.max(0, totalRevenue - totalExpenses)

  // Parcela Tributável = Lucro Contábil - Lucro Isento
  const taxableIncome = Math.max(0, accountingProfit - exemptProfit)

  return {
    totalRevenue,
    totalExpenses,
    exemptProfit,
    accountingProfit,
    taxableIncome,
    breakdownBySector,
  }
}

/**
 * Alerta da regra dos 80% de compras/despesas sob faturamento total (Receita Federal).
 */
export function calculatePurchaseLimitAlert(totalExpenses: number, totalRevenue: number): PurchaseLimitResult {
  const purchaseLimit = totalRevenue * 0.80
  const isExceeded = totalRevenue > 0 && totalExpenses > purchaseLimit
  const usedPercentageOfRevenue = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0

  return {
    totalExpenses,
    totalRevenue,
    purchaseLimit,
    isExceeded,
    usedPercentageOfRevenue,
  }
}

/**
 * Resumo Consolidado para a DASN-SIMEI (Declaração Anual do MEI).
 */
export function generateAnnualDasnSummary(
  transactions: Array<{ type: 'INCOME' | 'EXPENSE'; amount: number; businessSector?: string | null }>
): DasnSummaryResult {
  let serviceRevenue = 0
  let commerceIndustryRevenue = 0

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') {
      const sector = tx.businessSector || 'SERVICE'
      if (sector === 'SERVICE') {
        serviceRevenue += tx.amount
      } else {
        commerceIndustryRevenue += tx.amount
      }
    }
  })

  return {
    serviceRevenue,
    commerceIndustryRevenue,
    totalRevenue: serviceRevenue + commerceIndustryRevenue,
    hasEmployees: false, // Default MEI sem empregado
  }
}
