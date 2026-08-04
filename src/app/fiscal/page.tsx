"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { downloadFiscalSummaryCSV } from "@/lib/export";
import {
  Landmark,
  Copy,
  Check,
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  X,
  KeyRound,
  ExternalLink,
  Repeat2,
  Download,
} from "lucide-react";

interface DasMonth {
  month: number;
  monthName: string;
  year: number;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "INSTALLMENT";
  isCurrentMonth: boolean;
  authCode: string | null;
  paidAt: string | null;
  installmentRef: string | null;
}

interface FiscalData {
  targetYear: number;
  user: {
    name?: string;
    cpfCnpj?: string;
    openingDate?: string;
    defaultSector?: string;
  };
  tetoStatus: {
    annualLimit: number;
    grossRevenueYear: number;
    remainingAmount: number;
    usedPercentage: number;
    monthsActive: number;
    isProportional: boolean;
    alertLevel: "NORMAL" | "WARNING" | "EXCEEDED";
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
  currentDasStatus: "PENDING" | "PAID" | "OVERDUE" | "INSTALLMENT";
  currentDasAmount: number;
  defaultDasAmount: number;
  dasMonths: DasMonth[];
  paidMonthsCount: number;
}

// Modal de confirmação de pagamento com campo de autenticação obrigatório
function PaymentModal({
  das,
  onConfirm,
  onClose,
  saving,
}: {
  das: DasMonth;
  onConfirm: (authCode: string, paidAt: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [authCode, setAuthCode] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const formatAuthCode = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    const parts = clean.match(/.{1,4}/g) || []
    return parts.join('.')
  }

  const handleSubmit = () => {
    setError("");
    onConfirm(authCode.trim(), paidAt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Confirmar Pagamento DAS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {das.monthName} / {das.year} — R$ {das.amount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              O <strong>código de autenticação</strong> é gerado pelo{" "}
              <strong>PGMEI (portal da Receita Federal)</strong> após o pagamento ser processado pelo banco.
              Ele comprova juridicamente que o DAS foi pago.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Código de Autenticação do PGMEI (opcional)</span>
            </label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => { setAuthCode(formatAuthCode(e.target.value)); setError(""); }}
              placeholder="Ex: 8310.2025.0001.2345.6789"
              maxLength={24}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Data Efetiva do Pagamento</span>
            </label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <a
            href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir PGMEI para obter o código de autenticação</span>
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Confirmar Pagamento"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Parcelamento PGMEI
function InstallmentModal({
  das,
  onConfirm,
  onClose,
  saving,
}: {
  das: DasMonth;
  onConfirm: (installmentRef: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [installmentRef, setInstallmentRef] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!installmentRef.trim()) {
      setError("Informe o número do parcelamento PGMEI.");
      return;
    }
    setError("");
    onConfirm(installmentRef.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Repeat2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Registrar Parcelamento PGMEI</h3>
              <p className="text-xs text-slate-500">{das.monthName} / {das.year}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              O parcelamento do DAS em atraso é feito diretamente no <strong>PGMEI</strong>.
              Registre aqui o número do parcelamento para rastreabilidade.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Número do Parcelamento PGMEI *
            </label>
            <input
              type="text"
              value={installmentRef}
              onChange={(e) => { setInstallmentRef(e.target.value); setError(""); }}
              placeholder="Ex: PGMEI-2025-00012345"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
          </div>

          <a
            href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir PGMEI para parcelar débitos</span>
          </a>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <Repeat2 className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Registrar Parcelamento"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Cálculo de dias até 31 de maio do próximo ano
function getDasnCountdown(): { days: number; isUrgent: boolean; isPast: boolean } {
  const now = new Date();
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  const deadline = new Date(year, 4, 31); // Maio (0-indexed) = 4
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { days: Math.abs(diff), isUrgent: diff <= 60 && diff > 0, isPast: diff < 0 };
}

export default function FiscalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fiscal, setFiscal] = useState<FiscalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const [paymentModal, setPaymentModal] = useState<DasMonth | null>(null);
  const [installmentModal, setInstallmentModal] = useState<DasMonth | null>(null);
  const [dasFilter, setDasFilter] = useState<'CURRENT' | 'PAID' | 'OVERDUE' | 'PENDING' | 'ALL'>('CURRENT');

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
      const res = await fetch("/api/fiscal");
      if (res.ok) {
        const data = await res.json();
        setFiscal(data);
      }
    } catch (err) {
      console.error("Erro ao buscar dados fiscais:", err);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como PAGO com código de autenticação
  const handleConfirmPayment = async (das: DasMonth, authCode: string, paidAt: string) => {
    try {
      setSaving(true);
      const res = await fetch("/api/fiscal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: das.month,
          year: das.year,
          status: "PAID",
          amount: das.amount,
          authCode,
          paidAt,
        }),
      });
      if (res.ok) {
        setPaymentModal(null);
        fetchFiscalData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar pagamento.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Desfazer pagamento
  const handleUndoPayment = async (das: DasMonth) => {
    if (!confirm(`Desfazer pagamento de ${das.monthName}/${das.year}?`)) return;
    try {
      setSaving(true);
      await fetch("/api/fiscal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: das.month,
          year: das.year,
          status: "PENDING",
          amount: das.amount,
          authCode: null,
          paidAt: null,
        }),
      });
      fetchFiscalData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Registrar parcelamento
  const handleConfirmInstallment = async (das: DasMonth, installmentRef: string) => {
    try {
      setSaving(true);
      const res = await fetch("/api/fiscal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: das.month,
          year: das.year,
          status: "INSTALLMENT",
          amount: das.amount,
          installmentRef,
        }),
      });
      if (res.ok) {
        setInstallmentModal(null);
        fetchFiscalData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar parcelamento.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyDasnSummary = () => {
    if (!fiscal) return;
    const summaryText = `DASN-SIMEI ${fiscal.targetYear}:\n- Receita Bruta de Serviços: R$ ${fiscal.dasnSummary.serviceRevenue.toFixed(2)}\n- Receita Bruta de Comércio/Indústria: R$ ${fiscal.dasnSummary.commerceIndustryRevenue.toFixed(2)}\n- Receita Bruta Total: R$ ${fiscal.dasnSummary.totalRevenue.toFixed(2)}\n- Possuiu empregados: Não`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const dasnCountdown = getDasnCountdown();

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!session || !fiscal) return null;

  const paidCount = fiscal.dasMonths.filter((m) => m.status === "PAID").length;
  const overdueCount = fiscal.dasMonths.filter((m) => m.status === "OVERDUE").length;
  const pendingCount = fiscal.dasMonths.filter((m) => m.status === "PENDING" || m.status === "INSTALLMENT").length;
  const currentMonthDas = fiscal.dasMonths.find((m) => m.isCurrentMonth);

  const filteredDasMonths = fiscal.dasMonths.filter((das) => {
    if (dasFilter === "CURRENT") return das.isCurrentMonth;
    if (dasFilter === "PAID") return das.status === "PAID";
    if (dasFilter === "OVERDUE") return das.status === "OVERDUE";
    if (dasFilter === "PENDING") return das.status === "PENDING" || das.status === "INSTALLMENT";
    return true; // 'ALL'
  });

  return (
    <Layout>
      <div className="space-y-8">

        {/* MODAIS */}
        {paymentModal && (
          <PaymentModal
            das={paymentModal}
            onConfirm={(authCode, paidAt) => handleConfirmPayment(paymentModal, authCode, paidAt)}
            onClose={() => setPaymentModal(null)}
            saving={saving}
          />
        )}
        {installmentModal && (
          <InstallmentModal
            das={installmentModal}
            onConfirm={(ref) => handleConfirmInstallment(installmentModal, ref)}
            onClose={() => setInstallmentModal(null)}
            saving={saving}
          />
        )}

        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Landmark className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Módulo Fiscal & DAS SIMEI
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Controle completo dos 12 meses do DAS, DASN-SIMEI, IRPF e Trava de Compras com rastreabilidade jurídica.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadFiscalSummaryCSV(fiscal)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/60 dark:border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Exportar Relatório CSV</span>
            </button>
            <button
              onClick={copyDasnSummary}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Dados Copiados!" : "Copiar DASN-SIMEI"}</span>
            </button>
          </div>
        </div>

        {/* 1. GRID DO DAS COM FILTROS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  1. Controle de Quitação do DAS ({fiscal.targetYear})
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Por padrão exibe o mês vigente. Clique nos cards abaixo para filtrar por status.
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <a
                href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center space-x-1"
              >
                <span>PGMEI Oficial</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARDS DE RESUMO E FILTROS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Card Mês Vigente */}
            <button
              onClick={() => setDasFilter("CURRENT")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                dasFilter === "CURRENT"
                  ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Mês Vigente</span>
                <span className={`w-2 h-2 rounded-full ${dasFilter === "CURRENT" ? "bg-white animate-pulse" : "bg-indigo-500"}`} />
              </div>
              <p className="text-lg font-black mt-2 truncate">
                {currentMonthDas?.monthName || "Mês Atual"}
              </p>
              <span className="text-[10px] opacity-80 font-semibold mt-1">Exibir Mês Atual</span>
            </button>

            {/* Card Quitados */}
            <button
              onClick={() => setDasFilter("PAID")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                dasFilter === "PAID"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Quitados</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${dasFilter === "PAID" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"}`}>
                  {paidCount}
                </span>
              </div>
              <p className="text-2xl font-black mt-2">{paidCount}</p>
              <span className="text-[10px] opacity-80 font-semibold mt-1">Pagos / Quitados</span>
            </button>

            {/* Card Vencidos */}
            <button
              onClick={() => setDasFilter("OVERDUE")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                dasFilter === "OVERDUE"
                  ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500 shadow-lg shadow-rose-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-700 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Vencidos</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${dasFilter === "OVERDUE" ? "bg-white/20 text-white" : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"}`}>
                  {overdueCount}
                </span>
              </div>
              <p className="text-2xl font-black mt-2">{overdueCount}</p>
              <span className="text-[10px] opacity-80 font-semibold mt-1">Em Atraso</span>
            </button>

            {/* Card Pendentes */}
            <button
              onClick={() => setDasFilter("PENDING")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                dasFilter === "PENDING"
                  ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-amber-700 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Pendentes</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${dasFilter === "PENDING" ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"}`}>
                  {pendingCount}
                </span>
              </div>
              <p className="text-2xl font-black mt-2">{pendingCount}</p>
              <span className="text-[10px] opacity-80 font-semibold mt-1">A Vencer / Aberto</span>
            </button>

            {/* Card Todos */}
            <button
              onClick={() => setDasFilter("ALL")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between col-span-2 sm:col-span-1 ${
                dasFilter === "ALL"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 ring-2 ring-slate-700 shadow-lg"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-400 text-slate-900 dark:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Todos</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  12
                </span>
              </div>
              <p className="text-2xl font-black mt-2">12</p>
              <span className="text-[10px] opacity-80 font-semibold mt-1">Ver 12 Meses</span>
            </button>
          </div>

          {/* GRID DE MESES FILTRADOS */}
          {filteredDasMonths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDasMonths.map((das) => (
                <div
                  key={das.month}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${das.isCurrentMonth
                      ? "ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80"
                    }`}
                >
                  {/* Header do card */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{das.monthName}</span>
                      {das.isCurrentMonth && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-600 text-white">
                          Atual
                        </span>
                      )}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${das.status === "PAID"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : das.status === "OVERDUE"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                            : das.status === "INSTALLMENT"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                        }`}
                    >
                      {das.status === "PAID"
                        ? "✓ PAGO"
                        : das.status === "OVERDUE"
                          ? "⚠ ATRASO"
                          : das.status === "INSTALLMENT"
                            ? "↩ PARCELA"
                            : "PENDENTE"}
                    </span>
                  </div>

                  {/* Valor e vencimento */}
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Valor DAS</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        R$ {das.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Vencimento: {das.dueDate}
                    </p>
                  </div>

                  {/* Auditoria — exibido apenas para meses pagos/parcelados */}
                  {das.status === "PAID" && das.authCode && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                        <KeyRound className="w-3 h-3" />
                        <span>Autenticação:</span>
                      </p>
                      <p className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 break-all">
                        {das.authCode}
                      </p>
                      {das.paidAt && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                          Pago em: {formatDate(das.paidAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {das.status === "INSTALLMENT" && das.installmentRef && (
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-0.5">
                      <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 flex items-center space-x-1">
                        <Repeat2 className="w-3 h-3" />
                        <span>Parcelamento:</span>
                      </p>
                      <p className="text-[10px] font-mono text-blue-800 dark:text-blue-300 break-all">
                        {das.installmentRef}
                      </p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="space-y-1.5">
                    {das.status === "PAID" ? (
                      <button
                        onClick={() => handleUndoPayment(das)}
                        disabled={saving}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                      >
                        <span>Desfazer Pagamento</span>
                      </button>
                    ) : das.status === "INSTALLMENT" ? (
                      <button
                        onClick={() => setPaymentModal(das)}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar Quitação</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setPaymentModal(das)}
                          disabled={saving}
                          className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar como Pago</span>
                        </button>
                        {das.status === "OVERDUE" && (
                          <button
                            onClick={() => setInstallmentModal(das)}
                            disabled={saving}
                            className="w-full py-1.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400"
                          >
                            <Repeat2 className="w-3.5 h-3.5" />
                            <span>Registrar Parcelamento</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Nenhum mês encontrado com o filtro selecionado.
              </p>
              <button
                onClick={() => setDasFilter("ALL")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Exibir todos os 12 meses
              </button>
            </div>
          )}

          {/* TABELA DE VALORES DO DAS */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Valores Oficiais do DAS por Atividade (Salário Mínimo R$ 1.412,00 — 2024)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-300">
              {[
                { label: "Serviços (ISS)", value: "R$ 75,60", detail: "INSS R$ 70,60 + ISS R$ 5,00" },
                { label: "Comércio/Indústria (ICMS)", value: "R$ 71,60", detail: "INSS R$ 70,60 + ICMS R$ 1,00" },
                { label: "Comércio & Serviços (Misto)", value: "R$ 76,60", detail: "INSS R$ 70,60 + ISS/ICMS R$ 6,00" },
                { label: "Caminhoneiro (12% INSS)", value: "R$ 174,44", detail: "INSS 12% R$ 169,44 + Imposto" },
              ].map((item) => (
                <div key={item.label} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="font-black text-indigo-600 dark:text-indigo-400">{item.value}</p>
                  <span className="text-[10px] text-slate-400">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. DASN-SIMEI */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  2. Declaração Anual DASN-SIMEI {fiscal.targetYear}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Campos exatos para preenchimento no Portal da Receita Federal • Prazo fatal: 31 de Maio
              </p>
            </div>

            {/* Countdown */}
            <div
              className={`shrink-0 flex items-center space-x-3 px-4 py-3 rounded-2xl border ${dasnCountdown.isPast
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                  : dasnCountdown.isUrgent
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                    : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                }`}
            >
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-black text-lg leading-none">
                  {dasnCountdown.isPast ? "VENCIDO" : `${dasnCountdown.days} dias`}
                </p>
                <p className="text-[10px] font-bold">
                  {dasnCountdown.isPast ? "Prazo 31/Mai encerrado" : "para o prazo 31/Mai"}
                </p>
              </div>
            </div>
          </div>

          {/* Campos da DASN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Campo 1 — Receita de Serviços
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                R$ {fiscal.dasnSummary.serviceRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prestação de Serviços (ISS)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Campo 2 — Receita de Comércio
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                R$ {fiscal.dasnSummary.commerceIndustryRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vendas / Indústria (ICMS)</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                Campo 3 — Receita Bruta Total
              </span>
              <p className="text-3xl font-black mt-2">
                R$ {fiscal.dasnSummary.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-indigo-200 mt-1">Total de receitas acumuladas no ano</p>
            </div>
          </div>

          {/* Campo empregados + Link Receita */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-xs">4</div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Possuiu Empregado Registrado?</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">NÃO</p>
                <p className="text-[10px] text-slate-500">MEI pode ter no máximo 1 empregado</p>
              </div>
            </div>

            <a
              href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATBHE/dasnsimeirf.app/Identificacao"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Acessar Portal DASN-SIMEI</span>
            </a>
          </div>
        </div>

        {/* 3. CALCULADORA IRPF */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                3. Calculadora de Isenção do IRPF (Pessoa Física)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Divisão do Lucro Isento e do Rendimento Tributável para sua Declaração de IRPF
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60">
              <span className="text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Lucro Isento de IRPF</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                R$ {fiscal.irpfResult.exemptProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-2">
                Alíquota legal de presunção (32% Serviços / 8% Comércio).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Lucro Contábil Real</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                R$ {fiscal.irpfResult.accountingProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Receita Bruta menos Despesas Comprovadas.</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
              <span className="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-300 tracking-wider">Rendimento Tributável IRPF</span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">
                R$ {fiscal.irpfResult.taxableIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">Sujeito à tabela progressiva do IR PF.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Orientações para IRPF:</strong> Declare{" "}
              <strong className="text-emerald-700 dark:text-emerald-400">
                R$ {fiscal.irpfResult.exemptProfit.toFixed(2)}
              </strong>{" "}
              em <em>"Rendimentos Isentos — Código 09 (Lucros e dividendos)"</em> e{" "}
              <strong className="text-amber-700 dark:text-amber-400">
                R$ {fiscal.irpfResult.taxableIncome.toFixed(2)}
              </strong>{" "}
              em <em>"Rendimentos Tributáveis Recebidos de PJ"</em>.
            </div>
          </div>
        </div>

        {/* 4. TRAVA DE COMPRAS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  4. Trava de Compras (Regra dos 80%)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Limite de aquisições de mercadorias em até 80% do faturamento bruto
              </p>
            </div>

            <span
              className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold uppercase ${fiscal.purchaseLimit.isExceeded
                  ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                }`}
            >
              {fiscal.purchaseLimit.isExceeded ? "⚠️ Limite Excedido" : "✓ Em Conformidade"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Despesas Comprovadas Registradas
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                R$ {fiscal.purchaseLimit.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Limite Máximo Permitido (80% da Receita)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                R$ {fiscal.purchaseLimit.purchaseLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
