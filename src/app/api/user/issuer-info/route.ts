import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, document, address } = body;

    // Validações
    if (!name || !document || !address) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Atualizar informações do emissor no banco de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        issuerName: name,
        issuerDocument: document,
        issuerAddress: address,
      },
    });

    return NextResponse.json({
      message: 'Informações do emissor atualizadas com sucesso',
    });

  } catch (error) {
    console.error('Erro ao atualizar informações do emissor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

