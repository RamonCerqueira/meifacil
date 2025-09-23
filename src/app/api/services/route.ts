import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'
import { z } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const services = await prisma.service.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(services)

      case 'POST':
        const validatedData = serviceSchema.parse(req.body)
        const newService = await prisma.service.create({
          data: validatedData
        })
        return res.status(201).json(newService)

      case 'PUT':
        const { id, ...updateData } = req.body
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório para atualização' })
        }
        
        const validatedUpdateData = serviceSchema.parse(updateData)
        const updatedService = await prisma.service.update({
          where: { id },
          data: validatedUpdateData
        })
        return res.status(200).json(updatedService)

      case 'DELETE':
        const { id: deleteId } = req.body
        if (!deleteId) {
          return res.status(400).json({ error: 'ID é obrigatório para exclusão' })
        }
        
        await prisma.service.delete({
          where: { id: deleteId }
        })
        return res.status(200).json({ message: 'Serviço excluído com sucesso' })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de serviços:', error)
    
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

