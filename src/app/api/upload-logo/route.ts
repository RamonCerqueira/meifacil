import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('logo') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const filename = `logo-${session.user.id}-${timestamp}.${extension}`

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    try {
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filepath, buffer)
    } catch (err) {
      console.error('Erro ao escrever arquivo:', err)
      return NextResponse.json({ error: 'Erro ao salvar arquivo no servidor' }, { status: 500 })
    }

    const logoUrl = `/uploads/${filename}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: { logoUrl },
    })

    return NextResponse.json({
      message: 'Logo enviado com sucesso',
      logoUrl,
    })
  } catch (error) {
    console.error('Erro no upload do logo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
