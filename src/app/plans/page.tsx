"use client";

import Layout from "@/components/Layout";
import { PlanUpgradeCard } from "@/components/PlanUpgradeCard";
import { Crown, ShieldCheck } from "lucide-react";

export default function PlansPage() {
  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white shadow-xl border border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Assinatura & Planos MEI Fácil
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              Escolha o plano ideal para alavancar a gestão do seu microempreendimento.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Pagamento Seguro via Mercado Pago</span>
          </div>
        </div>

        {/* CARD DE UPGRADE DE PLANO */}
        <PlanUpgradeCard />
      </div>
    </Layout>
  );
}
