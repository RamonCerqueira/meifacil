"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-2xl font-bold text-slate-900">Transações e Livro Caixa</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Registro completo de receitas e despesas com categorização fiscal para o MEI.
            </p>
          </div>
        </div>

        {/* Formulário de Lançamento */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Novo Lançamento Financeiro</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Lançamento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="INCOME">🟢 Receita (Entrada)</option>
                <option value="EXPENSE">🔴 Despesa (Saída)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Histórico</label>
              <input
                type="text"
                placeholder="Ex: Desenvolvimento de Website, Material de Escritório..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
            </div>

            {type === 'INCOME' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Setor Fiscal (Tributação)</label>
                <select
                  value={businessSector}
                  onChange={(e) => setBusinessSector(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="SERVICE">Serviços (32% Isenção IRPF)</option>
                  <option value="COMMERCE">Comércio (8% Isenção IRPF)</option>
                  <option value="INDUSTRY">Indústria (8% Isenção IRPF)</option>
                  <option value="TRANSPORT">Transporte (16% Isenção IRPF)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Vinculado (Opcional)</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>{cli.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar Transação'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Histórico de Lançamentos</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Setor Fiscal</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Nenhum lançamento registrado.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type === 'INCOME' ? 'RECEITA' : 'DESPESA'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{tx.description}</td>
                      <td className="px-6 py-4 text-slate-500">{tx.client?.name || '-'}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {tx.type === 'INCOME' ? (tx.businessSector || 'SERVICE') : '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
