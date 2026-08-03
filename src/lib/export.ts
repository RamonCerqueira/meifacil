/**
 * Utilitários para exportação de dados em CSV e relatórios.
 */

export interface ExportTransaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  date: string
  category?: string
  businessSector?: string
  client?: { name: string }
}

/**
 * Converte a lista de transações para o formato CSV e dispara o download.
 */
export function downloadTransactionsCSV(transactions: ExportTransaction[], filename = 'transacoes_mei_facil.csv') {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação disponível para exportar.')
    return
  }

  const headers = ['ID', 'Data', 'Tipo', 'Descrição', 'Valor (R$)', 'Setor', 'Cliente']
  
  const rows = transactions.map((t) => [
    t.id,
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.type === 'INCOME' ? 'Receita (+)' : 'Despesa (-)',
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace('.', ','),
    t.businessSector || 'SERVIÇOS',
    `"${(t.client?.name || 'N/A').replace(/"/g, '""')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta o Relatório Anual DASN-SIMEI e Balanço Fiscal para CSV.
 */
export function downloadFiscalSummaryCSV(fiscalData: any, filename = 'relatorio_fiscal_dasn.csv') {
  if (!fiscalData) return

  const rows = [
    ['MEI FÁCIL — RELATÓRIO CONTÁBIL & DASN-SIMEI', `Ano: ${fiscalData.targetYear}`],
    ['', ''],
    ['--- 1. CONTROLE DE LIMITE DO TETO ---', ''],
    ['Teto Anual Permitido (R$)', fiscalData.tetoStatus.annualLimit.toFixed(2).replace('.', ',')],
    ['Faturamento Acumulado no Ano (R$)', fiscalData.tetoStatus.grossRevenueYear.toFixed(2).replace('.', ',')],
    ['Margem Restante (R$)', fiscalData.tetoStatus.remainingAmount.toFixed(2).replace('.', ',')],
    ['Percentual Utilizado (%)', fiscalData.tetoStatus.usedPercentage.toFixed(2).replace('.', ',')],
    ['', ''],
    ['--- 2. DECLARAÇÃO ANUAL (DASN-SIMEI) ---', ''],
    ['Campo 1 — Receita de Serviços (ISS)', fiscalData.dasnSummary.serviceRevenue.toFixed(2).replace('.', ',')],
    ['Campo 2 — Receita de Comércio/Indústria (ICMS)', fiscalData.dasnSummary.commerceIndustryRevenue.toFixed(2).replace('.', ',')],
    ['Campo 3 — Receita Bruta Total', fiscalData.dasnSummary.totalRevenue.toFixed(2).replace('.', ',')],
    ['Possuiu Empregado Registrado?', 'NÃO'],
    ['', ''],
    ['--- 3. DECLARAÇÃO IRPF (PESSOA FÍSICA) ---', ''],
    ['Lucro Isento de IRPF (Presunção Legal)', fiscalData.irpfResult.exemptProfit.toFixed(2).replace('.', ',')],
    ['Lucro Contábil Real', fiscalData.irpfResult.accountingProfit.toFixed(2).replace('.', ',')],
    ['Rendimento Tributável IRPF', fiscalData.irpfResult.taxableIncome.toFixed(2).replace('.', ',')],
    ['', ''],
    ['--- 4. HISTÓRICO DAS MENSAL (12 MESES) ---', ''],
    ['Mês', 'Valor (R$)', 'Vencimento', 'Status', 'Código Autenticação PGMEI'],
    ...fiscalData.dasMonths.map((das: any) => [
      das.monthName,
      das.amount.toFixed(2).replace('.', ','),
      das.dueDate,
      das.status === 'PAID' ? 'PAGO' : das.status === 'INSTALLMENT' ? 'PARCELADO' : das.status === 'OVERDUE' ? 'EM ATRASO' : 'PENDENTE',
      das.authCode || 'N/A',
    ]),
  ]

  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
