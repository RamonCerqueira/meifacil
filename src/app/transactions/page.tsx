"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { downloadTransactionsCSV } from "@/lib/export";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  Download
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

interface Client {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category] = useState('Geral');
  const [businessSector, setBusinessSector] = useState<'SERVICE' | 'COMMERCE' | 'INDUSTRY' | 'TRANSPORT'>('SERVICE');
  const [clientId, setClientId] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const [resTx, resCli] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/clients')
      ]);

      if (resTx.ok) {
        const dataTx = await resTx.json();
        setTransactions(dataTx);
      }

      if (resCli.ok) {
        const dataCli = await resCli.json();
        setClients(dataCli);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de transações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          description,
          date: new Date(),
          category,
          businessSector,
          clientId: clientId || undefined,
        }),
      });

      if (res.ok) {
        setDescription('');
        setAmount('');
        setClientId('');
        loadData();
      } else {
        alert('Erro ao salvar transação.');
      }
    } catch (err) {
      console.error('Erro ao submeter formulário:', err);
    } finally {
      setSubmitting(false);
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
        
        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Receipt className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Transações e Livro Caixa
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Registro simplificado de entradas e saídas com enquadramento de alíquota contábil para o MEI.
            </p>
          </div>

          <button
            onClick={() => downloadTransactionsCSV(transactions)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/60 dark:border-slate-700 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* FORMULÁRIO DE LANÇAMENTO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Novo Lançamento Financeiro</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="INCOME">🟢 Receita (Entrada)</option>
                <option value="EXPENSE">🔴 Despesa (Saída)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Consultoria, Compra de Peças..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {type === 'INCOME' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Setor Fiscal
                </label>
                <select
                  value={businessSector}
                  onChange={(e) => setBusinessSector(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="SERVICE">Serviços (32% Isenção IRPF)</option>
                  <option value="COMMERCE">Comércio (8% Isenção IRPF)</option>
                  <option value="INDUSTRY">Indústria (8% Isenção IRPF)</option>
                  <option value="TRANSPORT">Transporte (16% Isenção IRPF)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Cliente (Opcional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>{cli.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Salvar...' : 'Salvar Transação'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LISTAGEM DE TRANSAÇÕES (TABELA E CARDS RESPONSIVOS) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Histórico do Livro Caixa</h3>
            <span className="text-xs text-slate-500 font-semibold">{transactions.length} Lançamentos</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum lançamento registrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
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
