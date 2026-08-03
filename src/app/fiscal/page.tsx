"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface FiscalData {
  targetYear: number;
  user: {
    name?: string;
    cpfCnpj?: string;
    openingDate?: string;
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
    breakdownBySector: {
      SERVICE: { revenue: number; rate: number; exemptAmount: number };
      COMMERCE: { revenue: number; rate: number; exemptAmount: number };
      INDUSTRY: { revenue: number; rate: number; exemptAmount: number };
      TRANSPORT: { revenue: number; rate: number; exemptAmount: number };
    };
  };
  purchaseLimit: {
    totalExpenses: number;
    totalRevenue: number;
    purchaseLimit: number;
    isExceeded: boolean;
    usedPercentageOfRevenue: number;
  };
  dasnSummary: {
    serviceRevenue: number;
    commerceIndustryRevenue: number;
    totalRevenue: number;
    hasEmployees: boolean;
  };
  currentDasStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  currentDasAmount: number;
}

export default function FiscalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fiscal, setFiscal] = useState<FiscalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchFiscalData();
    }
  }, [status, router]);

  const fetchFiscalData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fiscal');
      if (res.ok) {
        const data = await res.json();
        setFiscal(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados fiscais:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyDasnSummary = () => {
    if (!fiscal) return;
    const summaryText = `DASN-SIMEI ${fiscal.targetYear}:
- Receita Bruta de Serviços: R$ ${fiscal.dasnSummary.serviceRevenue.toFixed(2)}
- Receita Bruta de Comércio/Indústria: R$ ${fiscal.dasnSummary.commerceIndustryRevenue.toFixed(2)}
- Receita Bruta Total: R$ ${fiscal.dasnSummary.totalRevenue.toFixed(2)}
- Possuiu empregados: Não`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session || !fiscal) return null;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <h1 className="text-2xl font-bold text-slate-900">Módulo Fiscal & Contábil MEI</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Ferramentas de conformidade com a Receita Federal, DASN-SIMEI e cálculo de IRPF.
            </p>
          </div>

          <button
            onClick={copyDasnSummary}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
          >
            {copied ? '✓ Dados Copiados!' : '📋 Copiar Dados da DASN-SIMEI'}
          </button>
        </div>

        {/* 1. Painel DASN-SIMEI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">1. Resumo para a DASN-SIMEI (Declaração Anual)</h2>
              <p className="text-xs text-slate-500">Valores consolidados exatamente como exigido no portal da Receita Federal</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
              Ano-Calendário {fiscal.targetYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="text-xs text-slate-500 font-semibold uppercase">Campo 1: Receita de Serviços</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                R$ {fiscal.dasnSummary.serviceRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Prestação de serviços em geral (ISS)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="text-xs text-slate-500 font-semibold uppercase">Campo 2: Receita de Comércio/Indústria</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                R$ {fiscal.dasnSummary.commerceIndustryRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Venda de mercadorias / fabricação (ICMS)</p>
            </div>

            <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md">
              <span className="text-xs text-blue-100 font-semibold uppercase">Campo 3: Receita Bruta Total</span>
              <p className="text-2xl font-black mt-1">
                R$ {fiscal.dasnSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-200 mt-1">Total de receitas acumuladas no ano</p>
            </div>
          </div>
        </div>

        {/* 2. Calculadora IRPF (Pessoa Física do Empreendedor) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">2. Calculadora de Isenção do IRPF (Pessoa Física)</h2>
            <p className="text-xs text-slate-500">
              Separação do Lucro Isento e do Rendimento Tributável para a sua Declaração de Ajuste Anual de IRPF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Lucro Isento de IRPF</span>
              <p className="text-2xl font-black text-emerald-700 mt-2">
                R$ {fiscal.irpfResult.exemptProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Calculado com base na alíquota legal de presunção (32% para serviços e 8% para comércio).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">Lucro Contábil (Receita - Despesas)</span>
              <p className="text-2xl font-black text-slate-800 mt-2">
                R$ {fiscal.irpfResult.accountingProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Sua receita bruta real menos as despesas comprovadas da sua operação.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80">
              <span className="text-xs font-bold uppercase text-amber-800 tracking-wider">Rendimento Tributável IRPF</span>
              <p className="text-2xl font-black text-amber-700 mt-2">
                R$ {fiscal.irpfResult.taxableIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Valor sujeito à tabela progressiva do Imposto de Renda Pessoa Física.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            💡 <strong>Dica Contábil:</strong> Para declarar seu IRPF com segurança, lance a quantia de <strong>R$ {fiscal.irpfResult.exemptProfit.toFixed(2)}</strong> na aba <em>"Rendimentos Isentos e Não Tributáveis"</em> (Código 09 - Lucros e dividendos recebidos) e a quantia de <strong>R$ {fiscal.irpfResult.taxableIncome.toFixed(2)}</strong> na aba <em>"Rendimentos Tributáveis Recebidos de PJ"</em>.
          </div>
        </div>

        {/* 3. Trava de Compras (Regra dos 80%) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Monitoramento da Trava de Compras (Regra dos 80%)</h2>
              <p className="text-xs text-slate-500">A Receita Federal estabelece que o MEI não pode comprar mercadorias/serviços acima de 80% do que faturou no ano.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              fiscal.purchaseLimit.isExceeded ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {fiscal.purchaseLimit.isExceeded ? '⚠️ LIMITE EXCEDIDO' : '✓ CONFORME'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Despesas Comprovadas Registradas</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                R$ {fiscal.purchaseLimit.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Limite Máximo Permitido (80% da Receita)</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                R$ {fiscal.purchaseLimit.purchaseLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
