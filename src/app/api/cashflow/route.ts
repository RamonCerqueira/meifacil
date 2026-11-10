import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const daysFromNow = (date: Date) => Math.ceil((date.getTime() - Date.now()) / 86_400_000)

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('days') || 30), 7), 90)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(today)
  until.setDate(until.getDate() + days)

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: today, lte: until } },
    orderBy: { date: 'asc' },
    select: { type: true, amount: true, description: true, date: true },
  })

  const entries = transactions.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
    daysUntil: daysFromNow(transaction.date),
  }))
  const income = entries.filter((entry) => entry.type === 'INCOME').reduce((sum, entry) => sum + entry.amount, 0)
  const expenses = entries.filter((entry) => entry.type === 'EXPENSE').reduce((sum, entry) => sum + entry.amount, 0)

  return NextResponse.json({ days, periodEnd: until, projectedIncome: income, projectedExpenses: expenses, projectedNet: income - expenses, entries })
}
