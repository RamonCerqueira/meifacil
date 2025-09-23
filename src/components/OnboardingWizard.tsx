import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Sparkles, Target, Zap, Shield } from 'lucide-react'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
}

export default function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    businessName: '',
    businessType: '',
    monthlyRevenue: '',
    goals: []
  })

  const steps = [
    {
      title: 'Bem-vindo ao MEI Fácil! 🎉',
      subtitle: 'Vamos configurar sua conta em poucos minutos',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Transforme sua gestão financeira
            </h3>
            <p className="text-gray-600">
              O MEI Fácil vai ajudar você a organizar suas finanças, 
              controlar clientes e gerar recibos profissionais de forma simples e rápida.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-700 font-medium">Organize</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-blue-700 font-medium">Automatize</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-purple-700 font-medium">Cresça</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Conte-nos sobre seu negócio',
      subtitle: 'Essas informações nos ajudam a personalizar sua experiência',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como você gostaria de ser chamado?
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva, Silva Consultoria..."
              value={userData.businessName}
              onChange={(e) => setUserData({...userData, businessName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é o seu ramo de atividade?
            </label>
            <select
              value={userData.businessType}
              onChange={(e) => setUserData({...userData, businessType: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Selecione uma opção</option>
              <option value="consultoria">Consultoria</option>
              <option value="design">Design/Criação</option>
              <option value="desenvolvimento">Desenvolvimento/TI</option>
              <option value="marketing">Marketing Digital</option>
              <option value="vendas">Vendas/Comércio</option>
              <option value="servicos">Prestação de Serviços</option>
              <option value="educacao">Educação/Treinamento</option>
              <option value="saude">Saúde/Bem-estar</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: 'Qual sua faixa de faturamento?',
      subtitle: 'Isso nos ajuda a sugerir as melhores funcionalidades para você',
      content: (
        <div className="space-y-3">
          {[
            { value: 'iniciante', label: 'Até R$ 1.000/mês', desc: 'Começando agora' },
            { value: 'crescendo', label: 'R$ 1.000 - R$ 5.000/mês', desc: 'Negócio em crescimento' },
            { value: 'estabelecido', label: 'R$ 5.000 - R$ 20.000/mês', desc: 'Negócio estabelecido' },
            { value: 'avancado', label: 'Acima de R$ 20.000/mês', desc: 'Negócio avançado' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setUserData({...userData, monthlyRevenue: option.value})}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                userData.monthlyRevenue === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-800">{option.label}</div>
              <div className="text-sm text-gray-600">{option.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Quais são seus principais objetivos?',
      subtitle: 'Selecione tudo que se aplica ao seu negócio',
      content: (
        <div className="space-y-3">
          {[
            { id: 'organizar', label: 'Organizar minhas finanças', icon: '📊' },
            { id: 'clientes', label: 'Gerenciar meus clientes', icon: '👥' },
            { id: 'recibos', label: 'Gerar recibos profissionais', icon: '📄' },
            { id: 'crescer', label: 'Fazer meu negócio crescer', icon: '📈' },
            { id: 'tempo', label: 'Economizar tempo', icon: '⏰' },
            { id: 'profissional', label: 'Ter uma imagem mais profissional', icon: '✨' }
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                const newGoals = userData.goals.includes(goal.id)
                  ? userData.goals.filter(g => g !== goal.id)
                  : [...userData.goals, goal.id]
                setUserData({...userData, goals: newGoals})
              }}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all flex items-center space-x-3 ${
                userData.goals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{goal.icon}</span>
              <span className="font-medium text-gray-800">{goal.label}</span>
              {userData.goals.includes(goal.id) && (
                <Check className="w-5 h-5 text-blue-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Tudo pronto! 🚀',
      subtitle: 'Sua conta está configurada e você já pode começar a usar',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Bem-vindo(a), {userData.businessName}!
            </h3>
            <p className="text-gray-600">
              Agora você pode começar a registrar suas transações, 
              cadastrar clientes e gerar recibos profissionais.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-800 mb-2">Próximos passos sugeridos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registre sua primeira receita ou despesa</li>
              <li>• Cadastre seus principais clientes</li>
              <li>• Explore o dashboard para ver suas métricas</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(userData)
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true
      case 1: return userData.businessName && userData.businessType
      case 2: return userData.monthlyRevenue
      case 3: return userData.goals.length > 0
      case 4: return true
      default: return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

