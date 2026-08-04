"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import ClientModal from "@/components/ClientModal";
import { formatCpfCnpj } from "@/lib/validations";
import { Users, Plus, Trash2, Mail, Phone, Building, Search, X, UserCheck } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  address?: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialName, setModalInitialName] = useState('');

  // Search & Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadClients();
    }
  }, [status, router]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return;

    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadClients();
      }
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
    }
  };

  const handleOpenModal = (initialName = '') => {
    setModalInitialName(initialName);
    setIsModalOpen(true);
  };

  // Autocomplete / Filtro inteligente a partir de 3 caracteres
  const isSearchActive = searchQuery.trim().length >= 3;

  const filteredClients = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (term.length < 3) return clients;

    const cleanDigits = term.replace(/\D/g, '');

    return clients.filter((cli) => {
      const matchName = cli.name.toLowerCase().includes(term);
      const matchEmail = cli.email ? cli.email.toLowerCase().includes(term) : false;
      const matchDoc = cleanDigits.length > 0 && cli.cpfCnpj ? cli.cpfCnpj.replace(/\D/g, '').includes(cleanDigits) : false;
      return matchName || matchEmail || matchDoc;
    });
  }, [clients, searchQuery]);

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
        
        {/* MODAL DE NOVO CLIENTE */}
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadClients}
          initialName={modalInitialName}
        />

        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestão de Clientes
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Cadastro unificado de tomadores de serviços e clientes para emissão de recibos.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Cliente</span>
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
                placeholder="Buscar por Nome, CPF ou CNPJ (mínimo 3 caracteres)..."
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
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{filteredClients.length} {filteredClients.length === 1 ? 'resultado' : 'resultados'} para "{searchQuery}"</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  {clients.length} {clients.length === 1 ? 'Cliente Cadastrado' : 'Clientes Cadastrados'}
                </span>
              )}
            </div>
          </div>

          {/* Dica de Busca Autocomplete */}
          {!isSearchActive && searchQuery.length > 0 && (
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 pl-1">
              💡 Digite pelo menos 3 caracteres para ativar a busca por Nome, CPF ou CNPJ.
            </p>
          )}
        </div>

        {/* LISTAGEM DE CLIENTES */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isSearchActive ? `Resultados da Busca (${filteredClients.length})` : 'Lista de Clientes'}
            </h3>
          </div>

          {clients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum cliente cadastrado ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Cadastre seus clientes para agilizar a emissão de recibos e controle de faturamento.</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar Primeiro Cliente</span>
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-400" />
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum cliente encontrado para "{searchQuery}".</p>
                <p className="text-xs text-slate-400 mt-1">Deseja cadastrar um novo cliente com este nome?</p>
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
              {filteredClients.map((cli) => (
                <div 
                  key={cli.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                          {cli.name[0].toUpperCase()}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{cli.name}</h4>
                      </div>

                      <button
                        onClick={() => handleDelete(cli.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      {cli.cpfCnpj && (
                        <p className="flex items-center space-x-1.5 font-mono text-[11px]">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatCpfCnpj(cli.cpfCnpj)}</span>
                        </p>
                      )}
                      {cli.email && (
                        <p className="flex items-center space-x-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cli.email}</span>
                        </p>
                      )}
                      {cli.phone && (
                        <p className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cli.phone}</span>
                        </p>
                      )}
                    </div>
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
