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
  getDasReference,
  BusinessSector,
} from '@/lib/fiscal'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get('year')
  const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let openingDate = new Date()
    let userName = session.user.name || 'MEI Empreendedor'
    let userCpfCnpj = ''
    let userSector = 'SERVICE'
    let transactions: any[] = []
    let dasPaymentsDb: any[] = []

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
      console.error('Banco de dados indisponível ao consultar dados fiscais:', dbErr)
      return NextResponse.json({ error: 'Dados fiscais indisponíveis no momento.' }, { status: 503 })
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

    let defaultDasAmount: number
    try {
      defaultDasAmount = getOfficialDasAmount(userSector, targetYear)
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Valor do DAS indisponível.' }, { status: 422 })
    }

    // Gerar os 12 meses do ano vigente (Janeiro a Dezembro) com status dinâmico
    const now = new Date()
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    const dasMonths = Array.from({ length: 12 }, (_, index) => {
      const mNum = index + 1
      const dbPayment = dasPaymentsDb.find((p) => p.month === mNum)
      
      let status = 'PENDING'
      let amount = dbPayment?.amount ? Number(dbPayment.amount) : defaultDasAmount
      // A competência de janeiro, por exemplo, vence em 20 de fevereiro.
      const dueDateValue = new Date(targetYear, mNum, 20, 23, 59, 59)

      if (dbPayment) {
        status = dbPayment.status
      } else {
        if (dueDateValue < now) {
          status = 'OVERDUE'
        }
      }

      return {
        month: mNum,
        monthName: monthNames[index],
        year: targetYear,
        amount,
        dueDate: dueDateValue.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        status, // 'PAID' | 'PENDING' | 'OVERDUE' | 'INSTALLMENT'
        isCurrentMonth: dueDateValue.getUTCFullYear() === now.getFullYear() && dueDateValue.getUTCMonth() === now.getMonth(),
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

    const currentMonthDas = dasMonths.find((m) => m.isCurrentMonth) || dasMonths[0]

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
      dasReference: getDasReference(targetYear),
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

    const parsedMonth = Number(month)
    const parsedYear = Number(year)
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear)) {
      return NextResponse.json({ error: 'Competência inválida.' }, { status: 400 })
    }
    if (!['PAID', 'PENDING', 'OVERDUE', 'INSTALLMENT'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
    }

    const defaultDasAmount = getOfficialDasAmount(undefined, parsedYear)
    const dueDate = new Date(parsedYear, parsedMonth, 20, 23, 59, 59)

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
          year: parsedYear,
          month: parsedMonth,
        },
      },
      update: updateData,
      create: {
        userId: session.user.id,
        year: parsedYear,
        month: parsedMonth,
        ...updateData,
      },
    })

    return NextResponse.json({ success: true, dasPayment })
  } catch (error) {
    console.error('Erro ao atualizar pagamento DAS:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
