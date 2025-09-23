import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '../../lib/prisma'
import formidable from 'formidable'
import path from 'path'
import fs from 'fs'

// Desabilitar o body parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const session = await getSession({ req })

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/uploads'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: function ({ mimetype }) {
      return mimetype && mimetype.includes('image')
    },
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err)
      return res.status(500).json({ message: 'Error uploading file', error: err.message })
    }

    const file = files.logo?.[0]

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const oldPath = file.filepath
    const newFileName = `${session.user?.email}-${Date.now()}${path.extname(file.originalFilename || '')}`
    const newPath = path.join(form.uploadDir as string, newFileName)

    // Renomear o arquivo para o novo caminho
    fs.rename(oldPath, newPath, async (renameErr) => {
      if (renameErr) {
        console.error('Error renaming file:', renameErr)
        return res.status(500).json({ message: 'Error saving file', error: renameErr.message })
      }

      const logoUrl = `/uploads/${newFileName}`

      try {
        await prisma.user.update({
          where: { email: session.user?.email as string },
          data: { logoUrl: logoUrl },
        })
        return res.status(200).json({ message: 'Logo uploaded successfully', logoUrl })
      } catch (dbError) {
        console.error('Error updating user logoUrl:', dbError)
        // Se houver erro no DB, tentar remover o arquivo recém-salvo
        fs.unlink(newPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error unlinking file after DB error:', unlinkErr)
        })
        return res.status(500).json({ message: 'Error updating user logo', error: (dbError as Error).message })
      }
    })
  })
}


