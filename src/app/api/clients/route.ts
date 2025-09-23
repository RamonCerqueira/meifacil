import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'
import { z } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const clients = await prisma.client.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(clients)

      case 'POST':
        const validatedData = clientSchema.parse(req.body)
        const newClient = await prisma.client.create({
          data: validatedData
        })
        return res.status(201).json(newClient)

      case 'PUT':
        const { id, ...updateData } = req.body
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório para atualização' })
        }
        
        const validatedUpdateData = clientSchema.parse(updateData)
        const updatedClient = await prisma.client.update({
          where: { id },
          data: validatedUpdateData
        })
        return res.status(200).json(updatedClient)

      case 'DELETE':
        const { id: deleteId } = req.body
        if (!deleteId) {
          return res.status(400).json({ error: 'ID é obrigatório para exclusão' })
        }
        
        await prisma.client.delete({
          where: { id: deleteId }
        })
        return res.status(200).json({ message: 'Cliente excluído com sucesso' })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de clientes:', error)
    
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

