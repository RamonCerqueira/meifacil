"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Crown, 
  QrCode, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock
} from "lucide-react";

interface PlanUpgradeCardProps {
  onSuccess?: () => void;
}

export function PlanUpgradeCard({ onSuccess }: PlanUpgradeCardProps) {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<{ plan: string; planExpiresAt: string | null; payments: any[] } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64?: string; ticketUrl?: string } | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chave pública do Mercado Pago
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || "TEST-8e54d550-93a7-47bc-a5e2-e1d5d14ff0e2";

  useEffect(() => {
    initMercadoPago(publicKey, { locale: "pt-BR" });
    fetchSubscription();
  }, [publicKey]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubData(data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da assinatura:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const initialization = {
    amount: 29.90,
    preferenceId: undefined,
  };

  const customization: any = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      maxInstallments: 12,
    },
    visual: {
      style: {
        theme: "default",
      },
    },
  };

  const onSubmit = async ({ formData }: any) => {
    setErrorMessage(null);
    try {
      const response = await fetch("/api/checkout/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar pagamento.");
      }

      if (result.status === "approved") {
        setPaymentSuccess(true);
        fetchSubscription();
        if (onSuccess) onSuccess();
      } else if (result.point_of_interaction?.transaction_data) {
        const tx = result.point_of_interaction.transaction_data;
        setPixData({
          qrCode: tx.qr_code,
          qrCodeBase64: tx.qr_code_base64,
          ticketUrl: tx.ticket_url,
        });
      } else {
        setErrorMessage("Pagamento enviado, aguardando confirmação da operadora.");
      }
    } catch (error: any) {
      console.error("Erro ao finalizar pagamento:", error);
      setErrorMessage(error.message || "Não foi possível concluir o pagamento.");
    }
  };

  const onError = (error: any) => {
    console.error("Erro no Brick do Mercado Pago:", error);
    setErrorMessage("Erro ao carregar o formulário do Mercado Pago. Tente recarregar a página.");
  };

  const onReady = () => {};

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const isProActive = subData?.plan === "PRO";

  return (
    <div className="space-y-6">
      {/* STATUS DA ASSINATURA ATUAL */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center space-x-1.5 ${
              isProActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}>
              <Crown className="w-3.5 h-3.5" />
              <span>Plano Atual: {isProActive ? "PRO MEI Fácil" : "GRATUITO"}</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isProActive ? "Sua conta possui acesso ilimitado!" : "Eleve a gestão do seu MEI para o próximo nível"}
          </h2>
          <p className="text-xs text-slate-300">
            {isProActive && subData?.planExpiresAt
              ? `Válido até ${new Date(subData.planExpiresAt).toLocaleDateString("pt-BR")}`
              : "Desbloqueie emissão de recibos ilimitada, relatórios avançados e suporte prioritário."}
          </p>
        </div>

        {!isProActive && !showCheckout && (
          <button
            onClick={() => setShowCheckout(true)}
            className="z-10 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Assinar PRO por R$ 29,90/mês</span>
          </button>
        )}
      </div>

      {/* COMPARAÇÃO DE RECURSOS (QUANDO NÃO ESTÁ NO CHECKOUT) */}
      {!showCheckout && !isProActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLANO GRATUITO */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plano Básico</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Gratuito</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para quem está começando a organizar as contas.</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Até 10 recibos por mês</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Controle financeiro básico</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Consulta de CNPJ no Gov.br</span>
              </li>
            </ul>
          </div>

          {/* PLANO PRO */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-500 dark:border-indigo-400 relative space-y-4 shadow-xl">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Recomendado
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Plano Profissional</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">R$ 29,90 <span className="text-xs font-semibold text-slate-500">/mês</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para o MEI que quer crescer sem limitações.</p>
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-bold">Emissão Ilimitada de Recibos em PDF</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Sincronização DASN-SIMEI & PGMEI</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Cálculo automático de teto proporcional do MEI</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Upload de logo personalizada nos documentos</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Suporte prioritário via WhatsApp</span>
              </li>
            </ul>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Quero o Plano PRO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TELA DE CHECKOUT EMBUTIDO (MERCADO PAGO CHECKOUT BRICKS) */}
      {showCheckout && !paymentSuccess && !pixData && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Pagamento Seguro via Mercado Pago</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha pagar com Cartão de Crédito ou Pix (Ativação imediata)
              </p>
            </div>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              Cancelar
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MERCADO PAGO PAYMENT BRICK EMBEDDED */}
          <div className="checkout-brick-container">
            <Payment
              initialization={initialization}
              customization={customization}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
            />
          </div>
        </div>
      )}

      {/* SUCESSO DO PAGAMENTO (CARTÃO DE CRÉDITO) */}
      {paymentSuccess && (
        <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pagamento Aprovado!</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Parabéns! Sua conta agora é **PRO MEI Fácil**. Todos os recursos ilimitados já estão disponíveis para uso.
          </p>
          <button
            onClick={() => {
              setPaymentSuccess(false);
              setShowCheckout(false);
            }}
            className="py-3 px-8 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
          >
            Acessar Recursos PRO
          </button>
        </div>
      )}

      {/* PIX QR CODE & COPIA E COLA */}
      {pixData && !paymentSuccess && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="space-y-1">
            <div className="inline-flex p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-2">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Pague com Pix para Ativar Agora</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Escaneie o QR Code abaixo no app do seu banco ou copie a chave Pix Copia e Cola.
            </p>
          </div>

          {pixData.qrCodeBase64 && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="Pix QR Code"
                className="w-48 h-48 rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md"
              />
            </div>
          )}

          <div className="space-y-2 max-w-md mx-auto">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Chave Pix Copia e Cola</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={pixData.qrCode}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono truncate"
              />
              <button
                onClick={() => handleCopyPix(pixData.qrCode)}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shrink-0 active:scale-95 transition-all"
              >
                {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center justify-center space-x-2 max-w-md mx-auto">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Assim que o pagamento for concluído no banco, o seu plano PRO será liberado automaticamente.</span>
          </div>

          <button
            onClick={() => {
              setPixData(null);
              setShowCheckout(false);
              fetchSubscription();
            }}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-bold underline"
          >
            Voltar aos Planos
          </button>
        </div>
      )}
    </div>
  );
}
