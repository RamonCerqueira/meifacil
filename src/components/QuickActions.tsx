import { useState } from 'react'
import { Plus, DollarSign, Users, FileText, Zap } from 'lucide-react'

interface QuickActionsProps {
  onNewTransaction: (type: 'RECEITA' | 'DESPESA') => void
  onNewClient: () => void
  onGenerateReceipt: () => void
}

export default function QuickActions({ onNewTransaction, onNewClient, onGenerateReceipt }: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    {
      id: 'receita',
      label: 'Recebi Dinheiro',
      description: 'Registrar pagamento recebido',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
      onClick: () => onNewTransaction('RECEITA')
    },
    {
      id: 'despesa',
      label: 'Gastei Dinheiro',
      description: 'Registrar despesa ou compra',
      icon: DollarSign,
      color: 'from-red-500 to-rose-600',
      hoverColor: 'hover:from-red-600 hover:to-rose-700',
      onClick: () => onNewTransaction('DESPESA')
    },
    {
      id: 'cliente',
      label: 'Novo Cliente',
      description: 'Cadastrar cliente rapidamente',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
      onClick: onNewClient
    },
    {
      id: 'recibo',
      label: 'Gerar Recibo',
      description: 'Criar recibo profissional',
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      hoverColor: 'hover:from-purple-600 hover:to-violet-700',
      onClick: onGenerateReceipt
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botões de ação expandidos */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="transform transition-all duration-300 ease-out"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isExpanded ? 'slideInUp 0.3s ease-out forwards' : 'slideOutDown 0.3s ease-in forwards'
              }}
            >
              <button
                onClick={() => {
                  action.onClick()
                  setIsExpanded(false)
                }}
                className={`flex items-center space-x-3 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[200px]`}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform ${
          isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110'
        } flex items-center justify-center`}
      >
        {isExpanded ? (
          <Plus className="w-6 h-6" />
        ) : (
          <Zap className="w-6 h-6" />
        )}
      </button>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  )
}

