import { z } from 'zod'
import { isCPF, isCNPJ } from 'validation-br'

// Utility functions for CPF/CNPJ validation and formatting
export const formatCpfCnpj = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 11) {
    // Format as CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    // Format as CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

export const validateCpfCnpj = (value: string): boolean => {
  if (!value) return true // Optional field
  
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length === 11) {
    return isCPF(numbers)
  } else if (numbers.length === 14) {
    return isCNPJ(numbers)
  }
  
  return false
}

// Custom Zod validator for CPF/CNPJ
const cpfCnpjValidator = z.string().refine(validateCpfCnpj, {
  message: 'CPF ou CNPJ inválido'
})

// Auth schemas
export const loginSchema = z.object({
  cpfCnpj: z.string().min(1, 'CPF ou CNPJ é obrigatório').refine(validateCpfCnpj, {
    message: 'CPF ou CNPJ inválido'
  }),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  cpfCnpj: z.string().min(1, 'CPF ou CNPJ é obrigatório').refine(validateCpfCnpj, {
    message: 'CPF ou CNPJ inválido'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

// Client schemas
export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpfCnpj: z.string().optional().refine((val) => !val || validateCpfCnpj(val), {
    message: 'CPF ou CNPJ inválido'
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// Service schemas
export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior que zero'),
})

// Transaction schemas
export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  date: z.date(),
  category: z.string().optional(),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
})

// Receipt schemas
export const receiptSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  issueDate: z.date(),
  dueDate: z.date().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  serviceId: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type ReceiptInput = z.infer<typeof receiptSchema>


// Plan pricing
export const PLAN_PRICES = {
  FREE: 0,
  PRO: 29.99
} as const

export type PlanType = keyof typeof PLAN_PRICES

