import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateTetoStatus,
  calculateIrpfExemption,
  calculatePurchaseLimitAlert,
  generateAnnualDasnSummary,
  getOfficialDasAmount,
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
    let userSector = 'SERVICE'
    let transactions: any[] = []
    let dasPaymentsDb: any[] = []

    if (session?.user?.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { openingDate: true, createdAt: true, name: true, cpfCnpj: true, defaultSector: true },
        })
        if (user) {
          openingDate = user.openingDate || user.createdAt || new Date()
          if (user.name) userName = user.name
          if (user.cpfCnpj) userCpfCnpj = user.cpfCnpj
          if (user.defaultSector) userSector = user.defaultSector
        }

        const startDate = new Date(targetYear, 0, 1)
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59)

        transactions = await prisma.transaction.findMany({
          where: {
            userId: session.user.id,
            date: { gte: startDate, lte: endDate },
          },
        })

        dasPaymentsDb = await prisma.dasPayment.findMany({
          where: { userId: session.user.id, year: targetYear },
        })
      } catch (dbErr) {
        console.warn('Banco de dados indisponível (usando modo demonstrativo de 12 meses):', dbErr)
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

    const defaultDasAmount = getOfficialDasAmount(userSector)

    // Gerar os 12 meses do ano vigente (Janeiro a Dezembro) com status dinâmico
    const currentMonthNum = new Date().getMonth() + 1
    const currentDay = new Date().getDate()
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    const dasMonths = Array.from({ length: 12 }, (_, index) => {
      const mNum = index + 1
      const dbPayment = dasPaymentsDb.find((p) => p.month === mNum)
      
      let status = 'PENDING'
      let amount = dbPayment?.amount ? Number(dbPayment.amount) : defaultDasAmount

      if (dbPayment) {
        status = dbPayment.status
      } else {
        if (targetYear < new Date().getFullYear()) {
          status = 'OVERDUE'
        } else if (targetYear === new Date().getFullYear()) {
          if (mNum < currentMonthNum) {
            status = 'OVERDUE'
          } else if (mNum === currentMonthNum && currentDay > 20) {
            status = 'OVERDUE'
          } else {
            status = 'PENDING'
          }
        } else {
          status = 'PENDING'
        }
      }

      return {
        month: mNum,
        monthName: monthNames[index],
        year: targetYear,
        amount,
        dueDate: `20/${String(mNum).padStart(2, '0')}/${targetYear}`,
        status, // 'PAID' | 'PENDING' | 'OVERDUE' | 'INSTALLMENT'
        isCurrentMonth: targetYear === new Date().getFullYear() && mNum === currentMonthNum,
        authCode: dbPayment?.authCode || null,
        paidAt: dbPayment?.paidAt || null,
        installmentRef: dbPayment?.installmentRef || null,
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

    const currentMonthDas = dasMonths.find((m) => m.isCurrentMonth) || dasMonths[currentMonthNum - 1]

    return NextResponse.json({
      targetYear,
      user: { name: userName, cpfCnpj: userCpfCnpj, openingDate, defaultSector: userSector },
      tetoStatus,
      irpfResult,
      purchaseLimit,
      dasnSummary,
      currentDasStatus: currentMonthDas.status,
      currentDasAmount: currentMonthDas.amount,
      defaultDasAmount,
      dasMonths,
      paidMonthsCount: dasMonths.filter((m) => m.status === 'PAID').length,
    })
  } catch (error) {
    console.error('Erro na API fiscal:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

// PATCH /api/fiscal — Atualizar status mensal do DAS com comprovante de pagamento
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, status, amount, authCode, paidAt, installmentRef } = body

    if (!month || !year || !status) {
      return NextResponse.json({ error: 'month, year e status são obrigatórios' }, { status: 400 })
    }

    // Pagamento confirmado exige código de autenticação
    if (status === 'PAID' && !authCode?.trim()) {
      return NextResponse.json(
        { error: 'O código de autenticação do PGMEI é obrigatório para confirmar o pagamento.' },
        { status: 400 }
      )
    }

    const defaultDasAmount = getOfficialDasAmount()
    const dueDate = new Date(year, month - 1, 20)

    const updateData: any = {
      status,
      amount: amount || defaultDasAmount,
      dueDate,
      authCode: authCode?.trim() || null,
      installmentRef: installmentRef?.trim() || null,
    }

    // Registra data efetiva do pagamento
    if (status === 'PAID') {
      updateData.paidAt = paidAt ? new Date(paidAt) : new Date()
    } else {
      updateData.paidAt = null
    }

    const dasPayment = await prisma.dasPayment.upsert({
      where: {
        userId_year_month: {
          userId: session.user.id,
          year: parseInt(year),
          month: parseInt(month),
        },
      },
      update: updateData,
      create: {
        userId: session.user.id,
        year: parseInt(year),
        month: parseInt(month),
        ...updateData,
      },
    })

    return NextResponse.json({ success: true, dasPayment })
  } catch (error) {
    console.error('Erro ao atualizar pagamento DAS:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
