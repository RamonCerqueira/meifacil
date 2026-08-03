"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Carregando painel contábil...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const teto = fiscal?.tetoStatus;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Header de Boas-Vindas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
              Ano Fiscal {fiscal?.targetYear || new Date().getFullYear()}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Olá, {session.user.name || 'Empreendedor'}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhamento em tempo real das finanças e obrigações fiscais do seu MEI.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/transactions"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              + Nova Transação
            </Link>
            <Link
              href="/receipts"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              📄 Gerar Recibo
            </Link>
          </div>
        </div>

        {/* 🚨 Termômetro do Teto MEI (R$ 81.000,00) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">📊</span>
                <h2 className="text-lg font-bold tracking-wide text-slate-200">Termômetro do Teto MEI</h2>
                {teto?.isProportional && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Proporcional ({teto.monthsActive} meses)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Limite máximo permitido pela Receita Federal para manter seu enquadramento MEI.
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Teto Permitido</span>
              <p className="text-2xl font-black text-white">
                R$ {teto?.annualLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Barra de Progresso do Teto */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-300">
                Faturado: <strong className="text-white">R$ {teto?.grossRevenueYear.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
              <span className={teto && teto.usedPercentage >= 80 ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                {teto?.usedPercentage.toFixed(1)}% utilizado
              </span>
            </div>

            <div className="h-4 w-full bg-slate-700/80 rounded-full overflow-hidden p-0.5 border border-slate-600/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  teto && teto.usedPercentage >= 100
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : teto && teto.usedPercentage >= 80
                    ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, teto?.usedPercentage || 0)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-slate-400 pt-1">
              <span>R$ 0,00</span>
              <span>Margem restante: <strong className="text-emerald-400">R$ {teto?.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </div>

          {/* Alerta Contábil se próximo do teto */}
          {teto && teto.alertLevel !== 'NORMAL' && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-semibold border flex items-center space-x-3 ${
              teto.alertLevel === 'EXCEEDED'
                ? 'bg-red-500/20 text-red-200 border-red-500/40'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
            }`}>
              <span className="text-xl">⚠️</span>
              <span>{teto.alertMessage}</span>
            </div>
          )}
        </div>

        {/* 💳 Cards de Resumo Financeiro & Fiscal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Receitas Acumuladas</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-lg">💰</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              R$ {fiscal?.irpfResult.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total bruto faturado no ano</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Despesas Comprovadas</span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 text-lg">📉</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              R$ {fiscal?.irpfResult.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Custos e despesas operacionais</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Lucro Isento IRPF</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-lg">🛡️</span>
            </div>
            <p className="text-2xl font-black text-blue-600">
              R$ {fiscal?.irpfResult.exemptProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Livre de Imposto de Renda PF</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">DAS Mensal (SIMEI)</span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 text-lg">🏛️</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-black text-slate-900">
                R$ {fiscal?.currentDasAmount.toFixed(2)}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                fiscal?.currentDasStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {fiscal?.currentDasStatus === 'PAID' ? 'PAGO' : 'PENDENTE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Vencimento todo dia 20</p>
          </div>
        </div>

        {/* 📋 Transações Recentes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Últimas Transações</h3>
              <p className="text-xs text-slate-500">Histórico recente de entradas e saídas registradas</p>
            </div>
            <Link
              href="/transactions"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Ver Todas →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="text-4xl">📝</span>
              <p className="mt-2 text-sm font-medium">Nenhuma transação lançada ainda.</p>
              <Link
                href="/transactions"
                className="mt-4 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
              >
                + Adicionar primeira transação
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.type === 'INCOME' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.businessSector === 'COMMERCE' ? 'Comércio' : 'Serviços'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-sm font-bold ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
