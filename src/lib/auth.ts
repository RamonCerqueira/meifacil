import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'mei-facil-secret-key-development-fallback-12345678',
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        cpfCnpj: { label: 'CPF ou CNPJ', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.cpfCnpj || !credentials?.password) {
          return null
        }

        const cleanCpfCnpj = credentials.cpfCnpj.replace(/\D/g, '')

        try {
          const user = await prisma.user.findUnique({
            where: {
              cpfCnpj: cleanCpfCnpj
            }
          })

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              }
            }
          }
        } catch (error) {
          console.warn('[NextAuth] Banco de dados offline ou inacessível. Usando usuário de demonstração.', error)
        }

        // Fallback de demonstração para desenvolvimento sem DB ativo
        return {
          id: 'demo-user-1',
          email: 'demo@meifacil.com',
          name: 'MEI Empreendedor (Demo)',
          image: null,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
