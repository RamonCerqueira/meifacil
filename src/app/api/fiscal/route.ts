import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateTetoStatus,
  calculateIrpfExemption,
  calculatePurchaseLimitAlert,
  generateAnnualDasnSummary,
  BusinessSector,
} from '@/lib/fiscal'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get('year')
  const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

  try {
    const session = await getServerSession(authOptions)

    let openingDate = new Date()
    let userName = session?.user?.name || 'MEI Empreendedor'
    let userCpfCnpj = '00.000.000/0001-00'
    let transactions: any[] = []
    let dasPaymentStatus = 'PENDING'

    if (session?.user?.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { openingDate: true, createdAt: true, name: true, cpfCnpj: true },
        })
        if (user) {
          openingDate = user.openingDate || user.createdAt || new Date()
          if (user.name) userName = user.name
          if (user.cpfCnpj) userCpfCnpj = user.cpfCnpj
        }

        const startDate = new Date(targetYear, 0, 1)
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59)

        transactions = await prisma.transaction.findMany({
          where: {
            userId: session.user.id,
            date: { gte: startDate, lte: endDate },
          },
        })

        const currentMonth = new Date().getMonth() + 1
        const dasPayment = await prisma.dasPayment.findFirst({
          where: { userId: session.user.id, year: targetYear, month: currentMonth },
        })
        if (dasPayment) dasPaymentStatus = dasPayment.status
      } catch (dbErr) {
        console.warn('Banco de dados indisponível (usando modo demonstrativo):', dbErr)
      }
    }

    let grossRevenueYear = 0
    let totalExpensesYear = 0
    const revenueBySector: Record<BusinessSector, number> = {
      SERVICE: 0,
      COMMERCE: 0,
      INDUSTRY: 0,
      TRANSPORT: 0,
    }

    transactions.forEach((tx) => {
      const amount = Number(tx.amount)
      if (tx.type === 'INCOME') {
        grossRevenueYear += amount
        const sector = (tx.businessSector as BusinessSector) || 'SERVICE'
        if (revenueBySector[sector] !== undefined) {
          revenueBySector[sector] += amount
        } else {
          revenueBySector.SERVICE += amount
        }
      } else if (tx.type === 'EXPENSE') {
        totalExpensesYear += amount
      }
    })

    const tetoStatus = calculateTetoStatus(grossRevenueYear, openingDate, targetYear)
    const irpfResult = calculateIrpfExemption(revenueBySector, totalExpensesYear)
    const purchaseLimit = calculatePurchaseLimitAlert(totalExpensesYear, grossRevenueYear)
    const dasnSummary = generateAnnualDasnSummary(
      transactions.map((t) => ({
        type: t.type,
        amount: Number(t.amount),
        businessSector: t.businessSector,
      }))
    )

    return NextResponse.json({
      targetYear,
      user: { name: userName, cpfCnpj: userCpfCnpj, openingDate },
      tetoStatus,
      irpfResult,
      purchaseLimit,
      dasnSummary,
      currentDasStatus: dasPaymentStatus,
      currentDasAmount: 75.90,
    })
  } catch (error) {
    console.error('Erro na API fiscal:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
