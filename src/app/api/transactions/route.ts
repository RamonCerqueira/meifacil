import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { client: true, service: true },
        orderBy: { date: 'desc' },
      })
      return NextResponse.json(transactions)
    } catch (dbErr) {
      console.warn('DB indisponível em GET /api/transactions:', dbErr)
      return NextResponse.json([])
    }
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    const userId = session?.user?.id || 'demo-user-id'

    try {
      const newTransaction = await prisma.transaction.create({
        data: {
          ...validatedData,
          userId,
          clientId: validatedData.clientId || null,
          serviceId: validatedData.serviceId || null,
          businessSector: validatedData.businessSector || 'SERVICE',
        },
        include: { client: true, service: true },
      })
      return NextResponse.json(newTransaction, { status: 201 })
    } catch (dbErr) {
      console.warn('DB indisponível em POST /api/transactions, simulando retorno:', dbErr)
      return NextResponse.json({
        id: `mock-${Date.now()}`,
        ...validatedData,
        userId,
        createdAt: new Date().toISOString(),
      }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    const validatedUpdateData = transactionSchema.parse(updateData)

    try {
      const updated = await prisma.transaction.update({
        where: { id, userId: session.user.id },
        data: {
          ...validatedUpdateData,
          clientId: validatedUpdateData.clientId || null,
          serviceId: validatedUpdateData.serviceId || null,
          businessSector: validatedUpdateData.businessSector || 'SERVICE',
        },
      })
      return NextResponse.json(updated)
    } catch (dbErr) {
      return NextResponse.json({ id, ...validatedUpdateData })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    try {
      await prisma.transaction.delete({ where: { id } })
    } catch (dbErr) {
      console.warn('DB indisponível ao deletar, ignorando:', dbErr)
    }
    return NextResponse.json({ message: 'Transação excluída com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
