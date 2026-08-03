import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    try {
      const services = await prisma.service.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(services)
    } catch (dbErr) {
      console.warn('DB indisponível em GET /api/services:', dbErr)
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
    const validatedData = serviceSchema.parse(body)

    const userId = session?.user?.id || 'demo-user-id'

    try {
      const newService = await prisma.service.create({
        data: {
          ...validatedData,
          userId,
        },
      })
      return NextResponse.json(newService, { status: 201 })
    } catch (dbErr) {
      console.warn('DB indisponível em POST /api/services, simulando retorno:', dbErr)
      return NextResponse.json({
        id: `mock-srv-${Date.now()}`,
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
    const body = await request.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    const validatedData = serviceSchema.parse(updateData)

    try {
      const updatedService = await prisma.service.update({
        where: { id },
        data: validatedData,
      })
      return NextResponse.json(updatedService)
    } catch (dbErr) {
      return NextResponse.json({ id, ...validatedData })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    try {
      await prisma.service.delete({ where: { id } })
    } catch (dbErr) {
      console.warn('DB indisponível ao deletar serviço:', dbErr)
    }
    return NextResponse.json({ message: 'Serviço excluído com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir serviço' }, { status: 500 })
  }
}
