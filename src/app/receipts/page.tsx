"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { generateReceiptPDF, downloadPDF } from "@/lib/pdf";

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
              <span className="text-2xl">📄</span>
              <h1 className="text-2xl font-bold text-slate-900">Emissão de Recibos Profissionais</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Gere comprovantes de prestação de serviços em PDF com dados do seu MEI e do tomador.
            </p>
          </div>
        </div>

        {/* Formulário de Recibo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Gerar Recibo de Pagamento</h2>

          <form onSubmit={handleGeneratePDF} className="space-y-6">
            
            {/* Seção do Prestador */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dados do Emissor (Seu MEI)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Razão Social</label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={issuerDocument}
                    onChange={(e) => setIssuerDocument(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Comercial</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção do Cliente e Serviço */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dados do Cliente e Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Tomador</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione um cliente cadastrado...</option>
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.id}>{cli.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serviço Cadastrado (Opcional)</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione um serviço do catálogo...</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.name} (R$ {Number(srv.price).toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seção de Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada do Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Referente aos serviços de consultoria técnica prestados no mês de Agosto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor do Recibo (R$)</label>
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
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={generating}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>📥</span>
                <span>{generating ? 'Gerando Recibo PDF...' : 'Baixar Recibo em PDF'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}
