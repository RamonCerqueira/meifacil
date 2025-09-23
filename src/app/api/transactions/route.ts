import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'
import { z } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const transactions = await prisma.transaction.findMany({
          include: {
            client: true,
            service: true
          },
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(transactions)

      case 'POST':
        const validatedData = transactionSchema.parse(req.body)
        const newTransaction = await prisma.transaction.create({
          data: {
            ...validatedData,
            clientId: validatedData.clientId || null,
            serviceId: validatedData.serviceId || null
          },
          include: {
            client: true,
            service: true
          }
        })
        return res.status(201).json(newTransaction)

      case 'PUT':
        const { id, ...updateData } = req.body
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório para atualização' })
        }
        
        const validatedUpdateData = transactionSchema.parse(updateData)
        const updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            ...validatedUpdateData,
            clientId: validatedUpdateData.clientId || null,
            serviceId: validatedUpdateData.serviceId || null
          },
          include: {
            client: true,
            service: true
          }
        })
        return res.status(200).json(updatedTransaction)

      case 'DELETE':
        const { id: deleteId } = req.body
        if (!deleteId) {
          return res.status(400).json({ error: 'ID é obrigatório para exclusão' })
        }
        
        await prisma.transaction.delete({
          where: { id: deleteId }
        })
        return res.status(200).json({ message: 'Transação excluída com sucesso' })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de transações:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      })
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor' 
    })
  }
}

