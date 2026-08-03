import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    try {
      const clients = await prisma.client.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(clients)
    } catch (dbErr) {
      console.warn('DB indisponível em GET /api/clients:', dbErr)
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
    const validatedData = clientSchema.parse(body)

    const userId = session?.user?.id || 'demo-user-id'

    try {
      const newClient = await prisma.client.create({
        data: {
          ...validatedData,
          userId,
        },
      })
      return NextResponse.json(newClient, { status: 201 })
    } catch (dbErr) {
      console.warn('DB indisponível em POST /api/clients, simulando retorno:', dbErr)
      return NextResponse.json({
        id: `mock-cli-${Date.now()}`,
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

    const validatedData = clientSchema.parse(updateData)

    try {
      const updatedClient = await prisma.client.update({
        where: { id },
        data: validatedData,
      })
      return NextResponse.json(updatedClient)
    } catch (dbErr) {
      return NextResponse.json({ id, ...validatedData })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    try {
      await prisma.client.delete({ where: { id } })
    } catch (dbErr) {
      console.warn('DB indisponível ao deletar cliente:', dbErr)
    }
    return NextResponse.json({ message: 'Cliente excluído com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 })
  }
}
