import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, cpfCnpj, password } = registerSchema.parse(body)

    // Limpar CPF/CNPJ para armazenar apenas números
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '')

    // Verificar se o usuário já existe por email ou CPF/CNPJ
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { cpfCnpj: cleanCpfCnpj }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: 'Este email já está em uso' },
          { status: 400 }
        )
      }
      if (existingUser.cpfCnpj === cleanCpfCnpj) {
        return NextResponse.json(
          { message: 'Este CPF/CNPJ já está cadastrado' },
          { status: 400 }
        )
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpfCnpj: cleanCpfCnpj,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpfCnpj: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: {
          ...user,
          cpfCnpj: undefined // Não retornar CPF/CNPJ na resposta por segurança
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Se for erro de validação do Zod
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          message: 'Dados inválidos',
          errors: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

