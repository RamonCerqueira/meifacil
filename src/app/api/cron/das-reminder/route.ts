import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDasReminderEmail } from '@/lib/email'
import { getOfficialDasAmount } from '@/lib/fiscal'

export async function GET(request: NextRequest) {
  // Verificação básica de segurança via token (Cron Secret)
  const { searchParams } = new URL(request.url)
  const authHeader = request.headers.get('authorization')
  const secretParam = searchParams.get('secret')
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    console.error('CRON_SECRET não configurado')
    return NextResponse.json({ error: 'Serviço não configurado' }, { status: 503 })
  }

  if (secretParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const now = new Date()
    // O DAS vence no mês seguinte à competência: em novembro, lembra outubro.
    const competenceDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const currentMonth = competenceDate.getMonth() + 1
    const currentYear = competenceDate.getFullYear()
    const isPastDue = now.getDate() > 20

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    // Busca usuários cadastrados
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpfCnpj: true,
        defaultSector: true,
        dasPayments: {
          where: {
            year: currentYear,
            month: currentMonth,
          },
        },
      },
    })

    const results = []

    for (const user of users) {
      if (!user.email) continue

      const payment = user.dasPayments[0]
      const status = payment ? payment.status : 'PENDING'

      // Se já estiver PAGO ou PARCELADO, ignora
      if (status === 'PAID' || status === 'INSTALLMENT') continue

      const amount = payment ? Number(payment.amount) : getOfficialDasAmount(user.defaultSector || undefined, currentYear)
      const dueDate = new Date(currentYear, currentMonth, 20).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

      const emailResult = await sendDasReminderEmail({
        toEmail: user.email,
        userName: user.name || 'Empreendedor',
        document: user.cpfCnpj || '',
        dasAmount: amount,
        monthName: monthNames[currentMonth - 1],
        year: currentYear,
        dueDate,
        status: isPastDue ? 'OVERDUE' : 'PENDING',
      })

      results.push({
        user: user.email,
        status,
        sent: emailResult.success,
        simulated: emailResult.simulated || false,
      })
    }

    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      details: results,
    })
  } catch (error) {
    console.error('Erro na execução do Cron de Lembrete DAS:', error)
    return NextResponse.json({ error: 'Erro interno ao processar lembretes de DAS' }, { status: 500 })
  }
}
