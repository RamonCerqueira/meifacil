"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { LogoUpload } from "@/components/LogoUpload";
import { PlanUpgradeCard } from "@/components/PlanUpgradeCard";
import { formatCpfCnpj } from "@/lib/validations";
import { 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Save, 
  FileText, 
  ShieldCheck
} from "lucide-react";



export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [cnpjInput, setCnpjInput] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [sector, setSector] = useState<'SERVICE' | 'COMMERCE' | 'INDUSTRY' | 'TRANSPORT'>('SERVICE');
  
  const [searchingGov, setSearchingGov] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadUserData();
    }
  }, [status, router]);

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/user/issuer-info');
      if (res.ok) {
        const data = await res.json();
        if (data.issuerName) setName(data.issuerName);
        if (data.issuerDocument) setCnpjInput(formatCpfCnpj(data.issuerDocument));
        if (data.issuerAddress) setAddress(data.issuerAddress);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const handleGovSync = async () => {
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      alert('Por favor, informe um CNPJ válido com 14 dígitos.');
      return;
    }

    try {
      setSearchingGov(true);
      setSyncStatus(null);
      
      const res = await fetch(`/api/gov/cnpj?cnpj=${cleanCnpj}`);
      if (!res.ok) {
        throw new Error('Não foi possível obter os dados do Gov.br');
      }

      const data = await res.json();
      setName(data.razaoSocial || data.nomeFantasia);
      setAddress(data.addressFull || `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`);
      setOpeningDate(data.dataAbertura);
      
      setSyncStatus(`✓ CNPJ Sincronizado com o Gov.br (${data.situacaoCadastral})`);
    } catch (err) {
      console.error('Erro na consulta Gov.br:', err);
      alert('Erro ao consultar CNPJ na Receita Federal.');
    } finally {
      setSearchingGov(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/user/issuer-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          document: cnpjInput.replace(/\D/g, ''),
          address,
          openingDate,
          defaultSector: sector,
        }),
      });

      if (res.ok) {
        await update();
        alert('Dados do seu CNPJ salvos com sucesso!');
      } else {
        alert('Erro ao salvar informações.');
      }
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
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
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Configurações & Plano PRO
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Gerencie sua assinatura, sincronização automática com a Receita Federal e identidade dos recibos.
            </p>
          </div>
        </div>

        {/* PLANO & ASSINATURA (MERCADO PAGO) */}
        <PlanUpgradeCard />

        {/* 1. BUSCA INTELIGENTE GOV.BR */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black tracking-wide text-white">Sincronização Automática com a Receita Federal</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Digite seu CNPJ MEI abaixo para puxar instantaneamente sua Razão Social, Data de Abertura e Endereço Oficial sem digitar nada manualmente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="00.000.000/0001-00"
                value={cnpjInput}
                onChange={(e) => setCnpjInput(formatCpfCnpj(e.target.value))}
                className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-sm font-bold tracking-wider"
              />
            </div>

            <button
              onClick={handleGovSync}
              disabled={searchingGov}
              className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {searchingGov ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>{searchingGov ? 'Sincronizando...' : 'Buscar no Gov.br'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center space-x-2 mt-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* 2. FORMULÁRIO DE DADOS CADASTRAIS DO EMISSOR */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Dados de Identidade do Seu MEI
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Razão Social / Nome da Empresa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome oficial no CNPJ"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Abertura do CNPJ
                </label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={(e) => setOpeningDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Setor Principal de Atuação (Tributação IRPF)
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="SERVICE">Serviços (32% Isenção de IRPF)</option>
                  <option value="COMMERCE">Comércio (8% Isenção de IRPF)</option>
                  <option value="INDUSTRY">Indústria (8% Isenção de IRPF)</option>
                  <option value="TRANSPORT">Transporte de Cargas/Passageiros (16% Isenção)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Endereço Comercial Completo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvação...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. LOGO PARA RECIBOS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <LogoUpload />
        </div>

        {/* 4. ATALHOS OFICIAIS GOV.BR / NFS-E */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Portais Fiscais Oficiais do Gov.br</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://www.nfse.gov.br/emissornacional"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>Portal NFS-e Nacional</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Emissão oficial de Nota Fiscal de Serviço Eletrônica obrigatória para MEIs.
                </p>
              </div>
            </a>

            <a
              href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-start space-x-3 group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>PGMEI (Emissão do DAS)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gerador do boleto mensal do imposto DAS-SIMEI da Receita Federal.
                </p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
}
