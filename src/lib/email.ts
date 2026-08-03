export interface DasReminderPayload {
  toEmail: string
  userName: string
  document: string
  dasAmount: number
  monthName: string
  year: number
  dueDate: string
  status: 'PENDING' | 'OVERDUE'
}

/**
 * Envia ou simula o envio de e-mail de lembrete do imposto DAS MEI.
 */
export async function sendDasReminderEmail(payload: DasReminderPayload): Promise<{ success: boolean; id?: string; simulated?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY

  const subject = payload.status === 'OVERDUE'
    ? `🚨 URGENTE: Seu DAS MEI de ${payload.monthName}/${payload.year} está em atraso!`
    : `🗓️ Lembrete: Vencimento do DAS MEI de ${payload.monthName}/${payload.year} (Dia 20)`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 20px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
          .header { text-align: center; margin-bottom: 24px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-weight: 800; font-size: 12px; text-transform: uppercase; }
          .badge-pending { background-color: #fef3c7; color: #92400e; }
          .badge-overdue { background-color: #ffe4e6; color: #9f1239; }
          .amount-box { background: #f1f5f9; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
          .amount { font-size: 28px; font-weight: 900; color: #4f46e5; margin-top: 4px; }
          .btn { display: block; width: 100%; text-align: center; background: #4f46e5; color: #ffffff; padding: 14px; border-radius: 12px; font-weight: 700; text-decoration: none; margin-top: 24px; }
          .footer { font-size: 11px; text-align: center; color: #64748b; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>MEI Fácil — Gestão Fiscal</h2>
            <span class="badge ${payload.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}">
              ${payload.status === 'OVERDUE' ? '⚠️ EM ATRASO' : '⏰ LEMBRETE DE VENCIMENTO'}
            </span>
          </div>

          <p>Olá, <strong>${payload.userName}</strong> (${payload.document || 'MEI/CPF'})!</p>

          <p>
            ${payload.status === 'OVERDUE'
              ? `O imposto DAS referente a <strong>${payload.monthName}/${payload.year}</strong> venceu em <strong>${payload.dueDate}</strong> e consta como pendente no seu painel.`
              : `Lembramos que o imposto DAS de <strong>${payload.monthName}/${payload.year}</strong> vence no dia <strong>${payload.dueDate}</strong>.`}
          </p>

          <div class="amount-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Valor a Pagar</div>
            <div class="amount">R$ ${payload.dasAmount.toFixed(2)}</div>
          </div>

          <p style="font-size: 13px; color: #475569;">
            📌 <strong>Como quitar e manter regular:</strong><br/>
            1. Acesse o portal oficial <strong>PGMEI da Receita Federal</strong> ou o app do seu banco.<br/>
            2. Realize o pagamento.<br/>
            3. Registre o <strong>Código de Autenticação</strong> no MEI Fácil para comprovação jurídica.
          </p>

          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/fiscal" class="btn">
            Acessar Módulo Fiscal & Registrar Pagamento →
          </a>

          <div class="footer">
            Este é um e-mail automático enviado pelo MEI Fácil para ajudar a manter seu CNPJ regularizado perante a Receita Federal.
          </div>
        </div>
      </body>
    </html>
  `

  if (!apiKey) {
    console.log(`[SIMULAÇÃO E-MAIL MEI FÁCIL] Enviado para ${payload.toEmail}: ${subject}`)
    return { success: true, simulated: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MEI Fácil <alertas@meifacil.com.br>',
        to: [payload.toEmail],
        subject,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[E-MAIL ERROR]', err)
      return { success: false }
    }

    const data = await res.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error('[E-MAIL EXCEPTION]', error)
    return { success: false }
  }
}
