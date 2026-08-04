import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        issuerName: true,
        issuerDocument: true,
        issuerAddress: true,
        logoUrl: true,
        cpfCnpj: true,
        defaultSector: true,
        openingDate: true,
      },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar dados do emissor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }
    const body = await request.json()
    const { name, document, address } = body
    if (!name || !document || !address) {
      return NextResponse.json({ error: 'Todos os campos sao obrigatorios' }, { status: 400 })
    }
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: { issuerName: name, issuerDocument: document, issuerAddress: address },
      create: {
        id: session.user.id,
        email: session.user.email || `${session.user.id}@meifacil.local`,
        name: session.user.name || 'MEI Empreendedor',
        issuerName: name,
        issuerDocument: document,
        issuerAddress: address,
      },
    })
    return NextResponse.json({ message: 'Informacoes do emissor atualizadas com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar informacoes do emissor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }
    const body = await request.json()
    const { cpfCnpj, defaultSector, openingDate } = body
    const updateData: Record<string, unknown> = {}
    if (cpfCnpj) updateData.cpfCnpj = String(cpfCnpj).replace(/\D/g, '')
    if (defaultSector) updateData.defaultSector = defaultSector
    if (openingDate) updateData.openingDate = new Date(openingDate)

    await prisma.user.upsert({
      where: { id: session.user.id },
      update: updateData,
      create: {
        id: session.user.id,
        email: session.user.email || `${session.user.id}@meifacil.local`,
        name: session.user.name || 'MEI Empreendedor',
        ...updateData,
      },
    })
    return NextResponse.json({ success: true, message: 'Dados MEI atualizados.' })
  } catch (error: any) {
    console.error('Erro ao salvar onboarding MEI:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Este CPF/CNPJ já está cadastrado em outra conta.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
