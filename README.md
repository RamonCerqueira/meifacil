# MEI Fácil - Plataforma de Gestão Financeira para MEIs

## 📋 Sobre o Projeto

O MEI Fácil é uma plataforma SaaS completa desenvolvida especificamente para Microempreendedores Individuais (MEIs) e Freelancers brasileiros. A plataforma oferece ferramentas essenciais para gestão financeira, controle de clientes, geração de recibos profissionais e relatórios inteligentes.

## 🚀 Funcionalidades Principais

### ✅ Gestão Financeira
- Dashboard com métricas financeiras em tempo real
- Controle de receitas e despesas
- Relatórios automáticos e visualizações gráficas
- Acompanhamento de crescimento do negócio

### ✅ Gestão de Clientes
- Cadastro completo de clientes
- Organização por CPF/CNPJ
- Histórico de transações por cliente
- Interface intuitiva e profissional

### ✅ Geração de Recibos
- Recibos profissionais em PDF
- **NOVO**: Upload de logo da empresa
- **NOVO**: Identificação completa do emissor
- Personalização com dados da empresa
- Download instantâneo

### ✅ Autenticação Segura
- Login com CPF/CNPJ
- Autenticação via Google (NextAuth)
- Criptografia de nível bancário
- Sessões seguras

### ✅ Planos Flexíveis
- **Plano Free**: Até 10 clientes e 20 transações/mês
- **Plano Pro**: Recursos ilimitados por R$ 29,99/mês
- Sistema de feature flags para controle de acesso

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.3** - Framework React com SSR
- **React 19.1.0** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - APIs serverless
- **NextAuth.js** - Autenticação
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- pnpm
- PostgreSQL
- Conta Google (para OAuth)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd mei-facil-nextjs
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mei_facil"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Deploy no Vercel

1. **Conecte seu repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Deploy automático**

### Configurações necessárias:
- `DATABASE_URL`: String de conexão PostgreSQL
- `NEXTAUTH_URL`: URL da aplicação
- `NEXTAUTH_SECRET`: Chave secreta
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: Credenciais OAuth

## 🎯 Funcionalidades Implementadas

### ✅ Conversão para Next.js
- Migração completa de React/Vite para Next.js
- App Router com roteamento moderno
- API Routes para backend
- SSR e otimizações automáticas

### ✅ Upload de Logo
- Interface intuitiva para upload
- Validação de tipos de arquivo (PNG, JPG)
- Limite de tamanho (5MB)
- Armazenamento em `/public/uploads`
- Integração com geração de PDF

### ✅ Identificação do Emissor
- Formulário para configurar dados do emissor
- Campos: Nome, CPF/CNPJ, Endereço
- Integração com recibos em PDF
- Persistência no banco de dados

### ✅ Autenticação Completa
- Login com CPF/CNPJ e senha
- Registro de novos usuários
- Validação de CPF/CNPJ
- Sessões seguras com NextAuth

### ✅ APIs Funcionais
- CRUD completo para clientes
- CRUD completo para serviços
- CRUD completo para transações
- Upload de arquivos
- Gestão de usuários

## 🔒 Segurança

- Autenticação robusta com NextAuth.js
- Validação de dados com Zod
- Sanitização de inputs
- Proteção CSRF
- Sessões seguras
- Criptografia de senhas com bcrypt

---

**MEI Fácil** - Simplificando a gestão financeira para MEIs brasileiros 🇧🇷
