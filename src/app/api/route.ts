import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('logo') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `logo-${session.user.id}-${timestamp}.${extension}`;
    
    // Salvar arquivo no diretório public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);
    
    // Criar diretório se não existir
    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      // Se o diretório não existir, criar e tentar novamente
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filepath, buffer);
    }

    // Atualizar usuário no banco de dados com o caminho do logo
    const logoUrl = `/uploads/${filename}`;
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { logoUrl }
    });

    return NextResponse.json({ 
      message: 'Logo enviado com sucesso',
      logoUrl 
    });

  } catch (error) {
    console.error('Erro no upload do logo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

