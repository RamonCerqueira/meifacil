"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Briefcase, Plus, Trash2, Tag } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadServices();
    }
  }, [status, router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          price: parseFloat(price),
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        loadServices();
      } else {
        alert('Erro ao cadastrar serviço.');
      }
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return;

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadServices();
      }
    } catch (err) {
      console.error('Erro ao deletar serviço:', err);
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
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Catálogo de Serviços
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Cadastre os serviços oferecidos com preços pré-fixados para agilizar lançamentos e emissão de recibos.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Cadastrar Novo Serviço</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nome do Serviço
              </label>
              <input
                type="text"
                placeholder="Ex: Manutenção de Computadores, Consultoria..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Preço Padrão (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Descrição (Opcional)
              </label>
              <input
                type="text"
                placeholder="Detalhes do que está incluso"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-3 justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Salvando...' : 'Cadastrar Serviço'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LISTAGEM DE SERVIÇOS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Serviços Cadastrados</h3>
            <span className="text-xs text-slate-500 font-semibold">{services.length} Serviços</span>
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum serviço cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div 
                  key={srv.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <Tag className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[160px]">{srv.name}</h4>
                      </div>

                      <button
                        onClick={() => handleDelete(srv.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Excluir Serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {srv.description || 'Sem descrição detalhada.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400">Valor Sugerido</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      R$ {Number(srv.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
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
