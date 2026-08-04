"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import TransactionModal from "@/components/TransactionModal";
import { downloadTransactionsCSV } from "@/lib/export";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  category?: string;
  businessSector?: string;
  client?: { name: string };
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month & Type Filter State
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const resTx = await fetch('/api/transactions');
      if (resTx.ok) {
        const dataTx = await resTx.json();
        setTransactions(dataTx);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de transações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
    }
  };

  // Filtragem mensal de transações
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      const matchMonth = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      if (!matchMonth) return false;

      if (typeFilter === 'INCOME') return tx.type === 'INCOME';
      if (typeFilter === 'EXPENSE') return tx.type === 'EXPENSE';
      return true;
    });
  }, [transactions, selectedMonth, selectedYear, typeFilter]);

  // Resumo Financeiro do Mês Selecionado
  const monthSummary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
        const val = Number(tx.amount);
        if (tx.type === 'INCOME') income += val;
        if (tx.type === 'EXPENSE') expense += val;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions, selectedMonth, selectedYear]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* MODAL REUTILIZÁVEL DE TRANSAÇÃO */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
        />

        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Receipt className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Livro Caixa Mensal
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Histórico detalhado de receitas e despesas com apuração do resultado contábil do MEI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Transação</span>
            </button>

            <button
              onClick={() => downloadTransactionsCSV(monthlyTransactions)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-3 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/60 dark:border-slate-700 transition-all shrink-0"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* BARRA DE SELEÇÃO DE MÊS E ANO */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Período de Apuração</span>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i}>{name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FILTRO POR TIPO (TODOS / RECEITAS / DESPESAS) */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                typeFilter === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                typeFilter === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* CARDS DE RESUMO DO MÊS SELECIONADO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Entradas ({MONTH_NAMES[selectedMonth]})</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                + R$ {monthSummary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Saídas ({MONTH_NAMES[selectedMonth]})</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                - R$ {monthSummary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Resultado do Mês</span>
              <p className={`text-2xl font-black mt-1 ${monthSummary.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                R$ {monthSummary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* LISTAGEM DO LIVRO CAIXA MENSAL */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Lançamentos de {MONTH_NAMES[selectedMonth]} de {selectedYear}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              {monthlyTransactions.length} {monthlyTransactions.length === 1 ? 'Lançamento' : 'Lançamentos'}
            </span>
          </div>

          {monthlyTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Nenhum lançamento registrado em {MONTH_NAMES[selectedMonth]} de {selectedYear}.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Clique no botão abaixo para adicionar entradas ou saídas neste mês.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Lançamento</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black mt-0.5 ${
                      tx.type === 'INCOME' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.description}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}>
                          {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>📅 {new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                        {tx.client && <span>👤 {tx.client.name}</span>}
                        {tx.type === 'INCOME' && <span>🏷️ {tx.businessSector || 'SERVICE'}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-700">
                    <span className={`text-base font-black ${
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Excluir Transação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
