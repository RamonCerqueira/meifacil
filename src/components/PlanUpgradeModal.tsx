import { Button } from '@/components/ui/button'
import { getPlanFeatures, PLAN_PRICES } from '@/lib/plans'

interface PlanUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  feature: string
}

export default function PlanUpgradeModal({ isOpen, onClose, onUpgrade, feature }: PlanUpgradeModalProps) {
  if (!isOpen) return null

  const proFeatures = getPlanFeatures('PRO')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          Upgrade para o Plano Pro
        </h2>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Limite atingido!</strong> {feature}
          </p>
        </div>

        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600">
              R$ {PLAN_PRICES.PRO.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">por mês</div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Recursos inclusos:</h3>
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onUpgrade}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Fazer Upgrade
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          * Este é um ambiente de demonstração. Em produção, seria integrado com um gateway de pagamento.
        </p>
      </div>
    </div>
  )
}

