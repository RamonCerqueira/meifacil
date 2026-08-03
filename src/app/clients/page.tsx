"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { formatCpfCnpj } from "@/lib/validations";
import { Users, Plus, Trash2, Mail, Phone, Building } from "lucide-react";

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

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          cpfCnpj: cpfCnpj ? cpfCnpj.replace(/\D/g, '') : undefined,
          phone: phone || undefined,
          address: address || undefined,
        }),
      });

      if (res.ok) {
        setName('');
        setEmail('');
        setCpfCnpj('');
        setPhone('');
        setAddress('');
        loadClients();
      } else {
        alert('Erro ao salvar cliente.');
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    } finally {
      setSubmitting(false);
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
        </div>

        {/* FORMULÁRIO DE CADASTRO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Cadastrar Novo Cliente</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nome / Razão Social
              </label>
              <input
                type="text"
                placeholder="Ex: João Silva ou Empresa XYZ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Endereço
              </label>
              <input
                type="text"
                placeholder="Rua, número, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Salvando...' : 'Cadastrar Cliente'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LISTAGEM DE CLIENTES */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Clientes Cadastrados</h3>
            <span className="text-xs text-slate-500 font-semibold">{clients.length} Clientes</span>
          </div>

          {clients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum cliente cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((cli) => (
                <div 
                  key={cli.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {cli.name[0].toUpperCase()}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">{cli.name}</h4>
                      </div>

                      <button
                        onClick={() => handleDelete(cli.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {cli.cpfCnpj && (
                        <p className="flex items-center space-x-1.5 font-mono text-[11px]">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
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
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
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
