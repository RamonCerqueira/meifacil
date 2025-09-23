import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import QuickActions from './components/QuickActions'
import SmartForm from './components/SmartForm'
import OnboardingWizard from './components/OnboardingWizard'
import ClientForm from './components/ClientForm'
import ServiceForm from './components/ServiceForm'
import TransactionForm from './components/TransactionForm'
import PlanUpgradeModal from './components/PlanUpgradeModal'
import { useClients } from './hooks/useClients'
import { useServices } from './hooks/useServices'
import { useTransactions } from './hooks/useTransactions'
import { usePlan } from './hooks/usePlan'
import { generateReceipt } from './lib/pdf'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
}

interface Service {
  id: string
  name: string
  description?: string
  price: number
}

interface Transaction {
  id: string
  type: 'RECEITA' | 'DESPESA'
  description: string
  amount: number
  date: string
  clientId?: string
  serviceId?: string
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSmartForm, setShowSmartForm] = useState(false)
  const [smartFormType, setSmartFormType] = useState<'receita' | 'despesa' | 'cliente'>('receita')

  const handleLogin = () => {
    setCurrentView('login')
  }

  const handleRegister = () => {
    setCurrentView('register')
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setCurrentView('dashboard')
    setShowOnboarding(true)
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  const handleQuickAction = (type: 'RECEITA' | 'DESPESA') => {
    setSmartFormType(type === 'RECEITA' ? 'receita' : 'despesa')
    setShowSmartForm(true)
  }

  const handleNewClient = () => {
    setSmartFormType('cliente')
    setShowSmartForm(true)
  }

  const handleGenerateReceipt = () => {
    // Implementar geração de recibo
    console.log('Gerar recibo')
  }

  if (!isAuthenticated) {
    if (currentView === 'landing') {
      return <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
    }
    
    if (currentView === 'login') {
      return (
        <AuthPage 
          mode="login" 
          onBack={handleBackToLanding} 
          onSuccess={handleAuthSuccess} 
        />
      )
    }
    
    if (currentView === 'register') {
      return (
        <AuthPage 
          mode="register" 
          onBack={handleBackToLanding} 
          onSuccess={handleAuthSuccess} 
        />
      )
    }
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/services" element={<Services />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Quick Actions */}
        <QuickActions
          onNewTransaction={handleQuickAction}
          onNewClient={handleNewClient}
          onGenerateReceipt={handleGenerateReceipt}
        />

        {/* Smart Form */}
        <SmartForm
          type={smartFormType}
          isOpen={showSmartForm}
          onClose={() => setShowSmartForm(false)}
          onSubmit={(data) => {
            console.log('Smart form data:', data)
            setShowSmartForm(false)
          }}
        />

        {/* Onboarding Wizard */}
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={(data) => {
            console.log('Onboarding data:', data)
            setShowOnboarding(false)
          }}
        />
      </Layout>
    </Router>
  )
}

const Dashboard = () => {
  const { transactions } = useTransactions()
  
  const receitas = transactions.filter(t => t.type === 'RECEITA')
  const despesas = transactions.filter(t => t.type === 'DESPESA')
  
  const totalReceitas = receitas.reduce((sum, t) => sum + t.amount, 0)
  const totalDespesas = despesas.reduce((sum, t) => sum + t.amount, 0)
  const saldo = totalReceitas - totalDespesas

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 text-lg">
            Acompanhe o desempenho do seu negócio em tempo real
          </p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Receitas */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Receitas Totais</p>
                <p className="text-3xl font-bold">R$ {totalReceitas.toFixed(2)}</p>
                <p className="text-green-100 text-sm mt-1">{receitas.length} transações</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">↗️</span>
              </div>
            </div>
          </div>

          {/* Card Despesas */}
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Despesas Totais</p>
                <p className="text-3xl font-bold">R$ {totalDespesas.toFixed(2)}</p>
                <p className="text-red-100 text-sm mt-1">{despesas.length} transações</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">↘️</span>
              </div>
            </div>
          </div>

          {/* Card Saldo */}
          <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Saldo Atual</p>
                <p className="text-3xl font-bold">R$ {saldo.toFixed(2)}</p>
                <p className="text-blue-100 text-sm mt-1">
                  {saldo >= 0 ? 'Lucro' : 'Prejuízo'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transações Recentes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Transações Recentes</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      transaction.type === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'RECEITA' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Mês */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumo do Mês</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Transações</span>
                <span className="font-semibold text-gray-800">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Média por Transação</span>
                <span className="font-semibold text-gray-800">
                  R$ {transactions.length > 0 ? ((totalReceitas + totalDespesas) / transactions.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Maior Receita</span>
                <span className="font-semibold text-green-600">
                  R$ {receitas.length > 0 ? Math.max(...receitas.map(r => r.amount)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Maior Despesa</span>
                <span className="font-semibold text-red-600">
                  R$ {despesas.length > 0 ? Math.max(...despesas.map(d => d.amount)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Clients = () => {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const handleSubmit = async (data: any) => {
    if (editingClient) {
      await updateClient(editingClient.id, data)
    } else {
      await createClient(data)
    }
    setShowForm(false)
    setEditingClient(null)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
        >
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
            {client.email && (
              <p className="text-gray-600 mb-1">📧 {client.email}</p>
            )}
            {client.phone && (
              <p className="text-gray-600 mb-1">📱 {client.phone}</p>
            )}
            {client.document && (
              <p className="text-gray-600 mb-4">📄 {client.document}</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(client)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

const Services = () => {
  const { services, isLoading, createService, updateService, deleteService } = useServices()
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const handleSubmit = async (data: any) => {
    if (editingService) {
      await updateService(editingService.id, data)
    } else {
      await createService(data)
    }
    setShowForm(false)
    setEditingService(null)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteService(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie seus serviços</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
        >
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
            {service.description && (
              <p className="text-gray-600 mb-3">{service.description}</p>
            )}
            <p className="text-2xl font-bold text-green-600 mb-4">R$ {service.price.toFixed(2)}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(service)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingService(null)
          }}
        />
      )}
    </div>
  )
}

const Transactions = () => {
  const { transactions, isLoading, createTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleSubmit = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
    } else {
      await createTransaction(data)
    }
    setShowForm(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Gerencie suas receitas e despesas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
        >
          Nova Transação
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.type === 'RECEITA' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}

const Receipts = () => {
  const { transactions } = useTransactions()
  const { clients } = useClients()
  const { services } = useServices()
  const { currentPlan, canUseFeature } = usePlan()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const receitas = transactions.filter(t => t.type === 'RECEITA')

  const handleGenerateReceipt = async (transaction: Transaction) => {
    if (!canUseFeature('receipts')) {
      setShowUpgradeModal(true)
      return
    }

    try {
      const client = clients.find(c => c.id === transaction.clientId)
      const service = services.find(s => s.id === transaction.serviceId)
      
      await generateReceipt({
        transaction,
        client,
        service
      })
    } catch (error) {
      console.error('Erro ao gerar recibo:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recibos</h1>
          <p className="text-gray-600">Gere recibos profissionais para suas receitas</p>
        </div>
        {currentPlan === 'FREE' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
            Plano Free: Recibos limitados
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receitas.map((receita) => {
              const client = clients.find(c => c.id === receita.clientId)
              return (
                <tr key={receita.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receita.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client?.name || 'Cliente não informado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {receita.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receita.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleGenerateReceipt(receita)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Gerar Recibo
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showUpgradeModal && (
        <PlanUpgradeModal
          feature="Recibos Profissionais"
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            console.log('Upgrade to Pro')
            setShowUpgradeModal(false)
          }}
        />
      )}
    </div>
  )
}

export default App

