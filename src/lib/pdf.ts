import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Transaction } from '@/hooks/useTransactions'
import { Client } from '@/hooks/useClients'
import { Service } from '@/hooks/useServices'

interface ReceiptData {
  transaction: Transaction
  client?: Client
  service?: Service
  companyInfo: {
    name: string
    cnpj: string
    address: string
    phone: string
    email: string
  }
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50

  // Header
  page.drawText('RECIBO DE PRESTAÇÃO DE SERVIÇOS', {
    x: margin,
    y: height - 80,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Company Info
  let yPosition = height - 120
  page.drawText('DADOS DO PRESTADOR:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
  })

  yPosition -= 25
  page.drawText(`Nome: ${data.companyInfo.name}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  yPosition -= 20
  page.drawText(`CNPJ: ${data.companyInfo.cnpj}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  yPosition -= 20
  page.drawText(`Endereço: ${data.companyInfo.address}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  yPosition -= 20
  page.drawText(`Telefone: ${data.companyInfo.phone}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  yPosition -= 20
  page.drawText(`E-mail: ${data.companyInfo.email}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  // Client Info
  yPosition -= 40
  page.drawText('DADOS DO CLIENTE:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
  })

  if (data.client) {
    yPosition -= 25
    page.drawText(`Nome: ${data.client.name}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font,
    })

    if (data.client.cpfCnpj) {
      yPosition -= 20
      page.drawText(`CPF/CNPJ: ${data.client.cpfCnpj}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
      })
    }

    if (data.client.address) {
      yPosition -= 20
      page.drawText(`Endereço: ${data.client.address}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
      })
    }
  } else {
    yPosition -= 25
    page.drawText('Cliente não especificado', {
      x: margin,
      y: yPosition,
      size: 10,
      font,
    })
  }

  // Service Info
  yPosition -= 40
  page.drawText('DESCRIÇÃO DO SERVIÇO:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
  })

  yPosition -= 25
  page.drawText(data.transaction.description, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  if (data.service) {
    yPosition -= 20
    page.drawText(`Serviço: ${data.service.name}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font,
    })
  }

  // Amount and Date
  yPosition -= 40
  page.drawText('VALOR E DATA:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
  })

  yPosition -= 25
  page.drawText(`Valor: R$ ${data.transaction.amount.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0.5, 0),
  })

  yPosition -= 25
  page.drawText(`Data: ${new Date(data.transaction.date).toLocaleDateString('pt-BR')}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
  })

  // Footer
  yPosition = 150
  page.drawText('Este recibo foi gerado automaticamente pelo sistema MEI Fácil.', {
    x: margin,
    y: yPosition,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  yPosition -= 20
  page.drawText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, {
    x: margin,
    y: yPosition,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Receipt number
  const receiptNumber = `REC-${Date.now()}`
  page.drawText(`Número do recibo: ${receiptNumber}`, {
    x: width - 200,
    y: height - 50,
    size: 10,
    font,
  })

  return await pdfDoc.save()
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

