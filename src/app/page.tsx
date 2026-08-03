"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import FaturamentoChart from "@/components/FaturamentoChart";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Landmark, 
  FileText, 
  Plus, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";

interface FiscalData {
  targetYear: number;
  user: {
    name?: string;
    cpfCnpj?: string;
  };
  tetoStatus: {
    annualLimit: number;
    grossRevenueYear: number;
    remainingAmount: number;
    usedPercentage: number;
    monthsActive: number;
    isProportional: boolean;
    alertLevel: 'NORMAL' | 'WARNING' | 'EXCEEDED';
    alertMessage: string;
  };
  irpfResult: {
    totalRevenue: number;
    totalExpenses: number;
    exemptProfit: number;
    accountingProfit: number;
    taxableIncome: number;
  };
  purchaseLimit: {
    totalExpenses: number;
    totalRevenue: number;
    purchaseLimit: number;
    isExceeded: boolean;
    usedPercentageOfRevenue: number;
  };
  currentDasStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  currentDasAmount: number;
}

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  category?: string;
  businessSector?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fiscal, setFiscal] = useState<FiscalData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resFiscal, resTx] = await Promise.all([
        fetch('/api/fiscal'),
        fetch('/api/transactions')
      ]);

      if (resFiscal.ok) {
        const fiscalJson = await resFiscal.json();
        setFiscal(fiscalJson);
      }

      if (resTx.ok) {
        const txJson = await resTx.json();
        setRecentTransactions(txJson.slice(0, 5));
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carregando inteligência contábil MEI...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const teto = fiscal?.tetoStatus;

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* HEADER BEM-VINDO COM ATALHOS RÁPIDOS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ano Fiscal {fiscal?.targetYear || new Date().getFullYear()}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Olá, {session.user.name || 'Empreendedor'}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Acompanhamento contábil em tempo real do seu CNPJ MEI, faturamento e isenção fiscal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <Link
              href="/transactions"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
            </Link>
            
            <Link
              href="/receipts"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/60 dark:border-slate-700 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Gerar Recibo</span>
            </Link>
          </div>
        </div>

        {/* 🚨 BANNER DE ALERTA DO TETO MEI — aparece apenas acima de 50% */}
        {teto && teto.usedPercentage >= 50 && (
          <Link href="/fiscal" className={`block rounded-2xl p-4 sm:p-5 border transition-all hover:scale-[1.01] ${
            teto.usedPercentage >= 100
              ? 'bg-rose-600 border-rose-500 text-white shadow-xl shadow-rose-500/30'
              : teto.usedPercentage >= 80
              ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20'
              : 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${
                  teto.usedPercentage >= 80 ? 'bg-white/20' : 'bg-yellow-200 dark:bg-yellow-800'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm sm:text-base">
                    {teto.usedPercentage >= 100
                      ? '🔴 TETO MEI ULTRAPASSADO — Risco de desenquadramento!'
                      : teto.usedPercentage >= 80
                      ? '🟠 ATENÇÃO: Você usou ' + teto.usedPercentage.toFixed(1) + '% do teto anual do MEI'
                      : '🟡 Aviso: Faturamento em ' + teto.usedPercentage.toFixed(1) + '% do limite MEI'}
                  </p>
                  <p className={`text-xs mt-0.5 ${teto.usedPercentage >= 80 ? 'text-white/80' : 'text-yellow-700 dark:text-yellow-300'}`}>
                    {teto.usedPercentage >= 100
                      ? `Faturamento R$ ${teto.grossRevenueYear.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ultrapassou o limite de R$ ${teto.annualLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — Contate um contador imediatamente.`
                      : `Restam R$ ${teto.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir o limite de R$ ${teto.annualLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — Monitore de perto.`}
                  </p>
                </div>
              </div>
              <span className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs ${
                teto.usedPercentage >= 80 ? 'bg-white/20 text-white' : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
              }`}>
                Ver Módulo Fiscal →
              </span>
            </div>
          </Link>
        )}

        {/* 🚨 TERMÔMETRO DO TETO MEI (R$ 81.000,00) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
          {/* Background Glow Effect */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">Termômetro do Teto MEI</h2>
                {teto?.isProportional && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Teto Proporcional ({teto.monthsActive} meses)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Limite limite oficial da Receita Federal para permanecer enquadrado como MEI.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl text-left lg:text-right">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300 block">Teto Permitido</span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                R$ {teto?.annualLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Barra de Progresso com Indicador de Perigo */}
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-200">
                Faturamento Atual: <strong className="text-white text-base">R$ {teto?.grossRevenueYear.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
              <span className={teto && teto.usedPercentage >= 80 ? 'text-amber-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                {teto?.usedPercentage.toFixed(1)}% Usado
              </span>
            </div>

            <div className="h-5 w-full bg-slate-800/90 rounded-full overflow-hidden p-1 border border-slate-700/80 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  teto && teto.usedPercentage >= 100
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-lg shadow-rose-500/50'
                    : teto && teto.usedPercentage >= 80
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-lg shadow-amber-500/50'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-lg shadow-emerald-500/30'
                }`}
                style={{ width: `${Math.min(100, teto?.usedPercentage || 0)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-semibold text-slate-300 pt-1">
              <span>R$ 0,00</span>
              <span className="flex items-center space-x-1">
                <span>Margem Livre:</span>
                <strong className="text-emerald-400 text-sm">R$ {teto?.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>
          </div>

          {/* Alertas Fiscais */}
          {teto && teto.alertLevel !== 'NORMAL' && (
            <div className={`mt-6 p-4 rounded-2xl text-sm font-bold border flex items-center space-x-3 relative z-10 ${
              teto.alertLevel === 'EXCEEDED'
                ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
            }`}>
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <span>{teto.alertMessage}</span>
            </div>
          )}
        </div>

        {/* 💳 CARDS DE MÉTRICAS FINANCEIRAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Receita Bruta */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider">Faturamento Bruto</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              R$ {fiscal?.irpfResult.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              Total acumulado no ano
            </p>
          </div>

          {/* Despesas */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider">Despesas Operacionais</span>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              R$ {fiscal?.irpfResult.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 mr-1" />
              Custos comprovados
            </p>
          </div>

          {/* Lucro Isento IRPF */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider">Lucro Isento IRPF</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              R$ {fiscal?.irpfResult.exemptProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
              Isento de IRPF (Presunção)
            </p>
          </div>

          {/* DAS SIMEI */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider">Imposto DAS Mensal</span>
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  R$ {fiscal?.currentDasAmount.toFixed(2)}
                </p>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  fiscal?.currentDasStatus === 'PAID'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : new Date().getDate() > 20
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                }`}>
                  {fiscal?.currentDasStatus === 'PAID' 
                    ? '✓ PAGO' 
                    : new Date().getDate() > 20 
                    ? '⚠️ EM ATRASO' 
                    : 'PENDENTE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Vencimento: Dia 20 de cada mês
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center gap-2">
              <Link
                href="/fiscal"
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Confirmar Pagamento
              </Link>
              <a
                href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center space-x-1"
                title="Pagar ou Emitir no PGMEI da Receita Federal"
              >
                <span>PGMEI</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* 📈 GRÁFICO DE FATURAMENTO MENSAL */}
        {teto && (
          <FaturamentoChart
            annualLimit={teto.annualLimit}
            grossRevenueYear={teto.grossRevenueYear}
          />
        )}

        {/* 📋 TRANSAÇÕES RECENTES (RESPONSIVO PARA TABELAS E CARDS) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Últimas Transações</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lançamentos de receitas e despesas registrados</p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>Ver Completo</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma transação cadastrada ainda.</p>
              <Link
                href="/transactions"
                className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Adicionar primeiro lançamento
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black ${
                      tx.type === 'INCOME' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.businessSector === 'COMMERCE' ? 'Comércio' : 'Serviços'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-base font-black shrink-0 ml-4 ${
                    tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALERTA DAS VENCIMENTO */}
        {fiscal && fiscal.currentDasStatus !== 'PAID' && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            new Date().getDate() > 20
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : new Date().getDate() >= 15
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              : 'hidden'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-black text-sm">
                  {new Date().getDate() > 20
                    ? `🔴 DAS de ${new Date().toLocaleString('pt-BR', { month: 'long' })} em ATRASO — Venceu dia 20!`
                    : `🟠 DAS de ${new Date().toLocaleString('pt-BR', { month: 'long' })} vence em ${20 - new Date().getDate()} dia(s)`}
                </p>
                <p className="text-xs opacity-80">R$ {fiscal.currentDasAmount.toFixed(2)} — Pague no PGMEI e registre o código de autenticação no Módulo Fiscal.</p>
              </div>
            </div>
            <Link href="/fiscal" className="shrink-0 px-4 py-2 rounded-xl bg-current/10 hover:bg-current/20 font-bold text-xs border border-current/30 transition-all">
              Ir para Fiscal
            </Link>
          </div>
        )}

      </div>
    </Layout>
  );
}
