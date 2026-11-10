import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get('cnpj')?.replace(/\D/g, '')

    if (!cnpj || cnpj.length !== 14) {
      return NextResponse.json(
        { error: 'CNPJ inválido. Forneça 14 dígitos numéricos.' },
        { status: 400 }
      )
    }

    try {
      // A BrasilAPI distribui os dados públicos do CNPJ. Não se trata de uma
      // autenticação gov.br nem substitui certidões ou consultas restritas.
      const resGov = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MEIFacil-Contabil/1.0',
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8_000),
      })

      if (resGov.ok) {
        const data = await resGov.json()
        
        return NextResponse.json({
          cnpj: data.cnpj,
          razaoSocial: data.razao_social || data.nome_fantasia || 'MEI Cadastrado',
          nomeFantasia: data.nome_fantasia || data.razao_social || '',
          dataAbertura: data.data_inicio_atividade || new Date().toISOString().split('T')[0],
          situacaoCadastral: data.descricao_situacao_cadastral || 'ATIVA',
          opcaoSimei: data.opcao_pelo_simei ?? true,
          cnaePrincipalDescricao: data.cnae_fiscal_descricao || 'Serviços / Comércio MEI',
          cnaePrincipalCodigo: data.cnae_fiscal || 0,
          logradouro: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim(),
          numero: data.numero || 'S/N',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          cep: data.cep || '',
          addressFull: `${data.logradouro || ''}, ${data.numero || 'S/N'} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}, CEP: ${data.cep || ''}`,
          source: 'BrasilAPI — dados públicos do CNPJ',
          fetchedAt: new Date().toISOString(),
        })
      }
    } catch (apiErr) {
      console.warn('Erro ao consultar a base pública de CNPJ:', apiErr)
    }

    return NextResponse.json(
      { error: 'Consulta cadastral indisponível. Tente novamente ou preencha os dados manualmente.' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Erro na rota de consulta CNPJ Gov.br:', error)
    return NextResponse.json(
      { error: 'Erro interno ao consultar dados do CNPJ' },
      { status: 500 }
    )
  }
}
