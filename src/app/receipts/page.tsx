"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { generateReceiptPDF, downloadPDF } from "@/lib/pdf";
import { FileCheck2, Download, Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  cpfCnpj?: string;
  address?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

export default function ReceiptsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [issuerDocument, setIssuerDocument] = useState('');
  const [issuerAddress, setIssuerAddress] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadData();
      if (session.user) {
        setIssuerName(session.user.name || '');
      }
    }
  }, [status, router, session]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resCli, resSrv] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
      ]);

      if (resCli.ok) setClients(await resCli.json());
      if (resSrv.ok) setServices(await resSrv.json());
    } catch (err) {
      console.error('Erro ao carregar dados para recibos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const srv = services.find((s) => s.id === serviceId);
    if (srv) {
      if (!description) setDescription(srv.name);
      setAmount(srv.price.toString());
    }
  };

  const handleGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      setGenerating(true);
      const client = clients.find((c) => c.id === selectedClientId);
      const service = services.find((s) => s.id === selectedServiceId);

      const pdfBytes = await generateReceiptPDF({
        transaction: {
          id: `REC-${Date.now()}`,
          type: 'INCOME',
          description,
          amount: parseFloat(amount),
          date: new Date(),
          clientId: selectedClientId,
          serviceId: selectedServiceId,
        },
        client,
        service,
        companyInfo: {
          name: issuerName || session?.user?.name || 'MEI Prestador de Serviços',
          cnpj: issuerDocument || '00.000.000/0001-00',
          address: issuerAddress || 'Endereço não informado',
          phone: '(00) 00000-0000',
          email: session?.user?.email || 'contato@mei.com',
        },
      });

      downloadPDF(pdfBytes, `Recibo_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar recibo PDF:', err);
      alert('Erro ao gerar PDF do recibo.');
    } finally {
      setGenerating(false);
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
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Emissão de Recibos Profissionais
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Gere comprovantes de pagamento e recibos de serviços em PDF personalizados.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO DE RECIBO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Gerar Recibo de Pagamento (PDF)
          </h2>

          <form onSubmit={handleGeneratePDF} className="space-y-6">
            
            {/* Dados do Emissor */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                1. Dados do Emissor (Seu MEI)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome / Razão Social
                  </label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
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
                    placeholder="00.000.000/0001-00"
                    value={issuerDocument}
                    onChange={(e) => setIssuerDocument(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Endereço Comercial
                  </label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Cidade - UF"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Cliente e Serviço */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                2. Cliente e Serviço Vinculado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Cliente Tomador
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.id}>{cli.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Serviço Cadastrado (Opcional)
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Selecione do catálogo...</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.name} (R$ {Number(srv.price).toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Descrição e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição Detalhada do Serviço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Serviços de consultoria prestados referente ao mês..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor do Recibo (R$)
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
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>{generating ? 'Gerando Recibo PDF...' : 'Baixar Recibo em PDF'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}
