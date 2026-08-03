'use client'

import { TrendingUp, Info } from 'lucide-react'

interface MonthlyRevenue {
  monthName: string
  revenue: number
}

interface FaturamentoChartProps {
  annualLimit: number
  grossRevenueYear: number
  monthlyData?: MonthlyRevenue[]
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function FaturamentoChart({ annualLimit, grossRevenueYear, monthlyData }: FaturamentoChartProps) {
  const monthlyLimit = annualLimit / 12

  // Se não houver dados por mês fornecidos, gera a curva acumulada aproximada
  const chartData = MONTH_NAMES.map((month, idx) => {
    const dataObj = monthlyData?.[idx]
    const val = dataObj ? dataObj.revenue : (idx < new Date().getMonth() + 1 ? (grossRevenueYear / (new Date().getMonth() + 1)) : 0)
    return {
      month,
      revenue: val,
      percentageOfMonthly: monthlyLimit > 0 ? (val / monthlyLimit) * 100 : 0,
    }
  })

  const maxVal = Math.max(monthlyLimit * 1.3, ...chartData.map((d) => d.revenue))

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Evolução de Faturamento Mensal</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento mensal comparado ao teto proporcional (Média recomendada: R$ {monthlyLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-bold shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Faturamento</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 bg-rose-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Teto Médio (R$ {monthlyLimit.toFixed(0)})</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Responsivo */}
      <div className="relative pt-6 pb-2">
        {/* Linha do teto mensal */}
        <div
          className="absolute left-0 right-0 border-b-2 border-dashed border-rose-500/60 z-10 flex justify-end pr-2"
          style={{ bottom: `${(monthlyLimit / maxVal) * 160 + 32}px` }}
        >
          <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
            Limite Médio R$ {monthlyLimit.toFixed(0)}
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-3 px-2">
          {chartData.map((d) => {
            const barHeightPct = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0
            const isExceeded = d.revenue > monthlyLimit

            return (
              <div key={d.month} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                {/* Tooltip Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-xl">
                  {d.month}: R$ {d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>

                {/* Barra */}
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                    isExceeded
                      ? 'bg-gradient-to-t from-rose-600 to-amber-500 shadow-md shadow-rose-500/20'
                      : d.revenue > 0
                      ? 'bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(6, barHeightPct)}%` }}
                />

                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {d.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          O teto do MEI é calculado anualmente (ou proporcional aos meses ativos). Manter a receita mensal regular evita ultrapassar a margem de segurança de 20%.
        </span>
      </div>
    </div>
  )
}
