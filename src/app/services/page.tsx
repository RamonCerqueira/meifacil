"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import ServiceModal from "@/components/ServiceModal";
import { Briefcase, Plus, Trash2, Tag, Search, X, Check } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialName, setModalInitialName] = useState('');

  // Search & Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOpenModal = (initialName = '') => {
    setModalInitialName(initialName);
    setIsModalOpen(true);
  };

  // Autocomplete / Filtro inteligente a partir de 3 caracteres
  const isSearchActive = searchQuery.trim().length >= 3;

  const filteredServices = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (term.length < 3) return services;

    return services.filter((srv) => {
      const matchName = srv.name.toLowerCase().includes(term);
      const matchDesc = srv.description ? srv.description.toLowerCase().includes(term) : false;
      return matchName || matchDesc;
    });
  }, [services, searchQuery]);

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
        
        {/* MODAL DE NOVO SERVIÇO */}
        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadServices}
          initialName={modalInitialName}
        />

        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Serviço</span>
          </button>
        </div>

        {/* BARRA DE BUSCA E AUTOCOMPLETE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Buscar por Nome ou Descrição do Serviço (mínimo 3 caracteres)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Badges de Status da Busca */}
            <div className="flex items-center space-x-2 shrink-0">
              {isSearchActive ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{filteredServices.length} {filteredServices.length === 1 ? 'serviço' : 'serviços'} para "{searchQuery}"</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  {services.length} {services.length === 1 ? 'Serviço Cadastrado' : 'Serviços Cadastrados'}
                </span>
              )}
            </div>
          </div>

          {/* Dica de Busca Autocomplete */}
          {!isSearchActive && searchQuery.length > 0 && (
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 pl-1">
              💡 Digite pelo menos 3 caracteres para ativar o filtro autocomplete de serviços.
            </p>
          )}
        </div>

        {/* LISTAGEM DE SERVIÇOS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isSearchActive ? `Resultados da Busca (${filteredServices.length})` : 'Catálogo de Serviços'}
            </h3>
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum serviço cadastrado ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Cadastre seus serviços com preços fixos para agilizar a emissão de recibos.</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar Primeiro Serviço</span>
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-400" />
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum serviço encontrado para "{searchQuery}".</p>
                <p className="text-xs text-slate-400 mt-1">Deseja cadastrar um novo serviço com este nome?</p>
              </div>
              <button
                onClick={() => handleOpenModal(searchQuery)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar "{searchQuery}"</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((srv) => (
                <div 
                  key={srv.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{srv.name}</h4>
                      </div>

                      <button
                        onClick={() => handleDelete(srv.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
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
                    <span className="text-[10px] uppercase font-extrabold text-slate-400">Preço Padrão</span>
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
