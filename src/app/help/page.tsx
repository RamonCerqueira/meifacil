"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { 
  BookOpen, 
  ShieldAlert, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink,
  Award
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: 'DESENQUADRAMENTO' | 'IRPF' | 'DAS' | 'NFSE';
}

const faqs: FAQItem[] = [
  {
    category: 'DESENQUADRAMENTO',
    question: 'O que acontece se eu ultrapassar o teto de R$ 81.000,00 no ano?',
    answer: 'Se o faturamento ultrapassar até 20% (até R$ 97.200,00), o MEI recolherá um DAS complementar sobre o excesso e será migrado para Microempresa (ME) no ano seguinte. Se ultrapassar mais de 20%, o desenquadramento é retroativo a janeiro do ano corrente, devendo pagar impostos do Simples Nacional sobre todo o ano.'
  },
  {
    category: 'DESENQUADRAMENTO',
    question: 'O que é o teto proporcional no primeiro ano de CNPJ?',
    answer: 'Se você abriu o CNPJ MEI no decorrer do ano (ex: em Julho), seu limite de faturamento não é R$ 81.000,00, mas sim R$ 6.750,00 por mês de atividade até dezembro. Se abriu em Julho (6 meses), seu teto limite no ano de abertura será R$ 40.500,00 (6 x R$ 6.750,00).'
  },
  {
    category: 'DESENQUADRAMENTO',
    question: 'Por que o excesso de compras (80%) pode cancelar meu MEI?',
    answer: 'A Receita Federal e a Secretaria de Fazenda Estadual monitoram as compras com Nota Fiscal (NF-e) feitas no seu CNPJ. Pela lei (LC 123/2006), o MEI não pode comprar mais do que 80% do valor que faturou no ano. Comprar muito mais do que vende aciona alerta de omissão de receita e sonegação.'
  },
  {
    category: 'IRPF',
    question: 'O MEI precisa declarar Imposto de Renda Pessoa Física (IRPF)?',
    answer: 'Sim, caso seus rendimentos tributáveis (Lucro Tributável = Receita Bruta - Despesas - Parcela Isenta Presumida) ultrapassem o limite de isenção da Receita Federal (ex: R$ 30.639,90/ano). O nosso sistema calcula automaticamente essa isenção (32% para serviços, 8% para comércio) para você não pagar imposto indevido.'
  },
  {
    category: 'IRPF',
    question: 'Como funciona a porcentagem de Lucro Isento do MEI?',
    answer: 'A Receita Federal concede isenção de imposto de renda sobre um percentual da receita bruta: 32% para prestadores de serviços, 8% para comércio/indústria e 16% para transporte de passageiros. Esse valor entra na sua declaração PF como Rendimento Isento e Não Tributável.'
  },
  {
    category: 'DAS',
    question: 'O que acontece se eu esquecer de pagar a guia DAS mensal?',
    answer: 'O DAS vence todo dia 20. O atraso gera multa de 0,33% ao dia (máximo 20%) + juros SELIC. Além disso, o não pagamento por meses seguidos pode suspender o CNPJ, cancelar a cobertura previdenciária (INSS para aposentadoria e auxílio-doença) e inscrever a dívida na Dívida Ativa da União.'
  },
  {
    category: 'DAS',
    question: 'O que é a DASN-SIMEI e quando devo entregar?',
    answer: 'É a Declaração Anual de Faturamento do MEI. Deve ser entregue obrigatoriamente até o dia 31 de Maio de cada ano pelo Portal do Simples Nacional, informando o total faturado no ano anterior (com e sem emissão de nota fiscal).'
  },
  {
    category: 'NFSE',
    question: 'Quando o MEI é obrigado a emitir Nota Fiscal?',
    answer: 'O MEI é obrigado a emitir Nota Fiscal sempre que prestar serviço ou vender mercadorias para Pessoas Jurídicas (Empresas/CNPJ). Para cliente Pessoa Física (CPF), a emissão é facultativa, a menos que o cliente solicite.'
  },
  {
    category: 'NFSE',
    question: 'Onde o MEI emite a Nota Fiscal de Serviço (NFS-e)?',
    answer: 'Desde Setembro de 2023, todos os MEIs do Brasil devem emitir NFS-e exclusivamente através do Portal do Emissor Nacional do Gov.br (www.nfse.gov.br/emissornacional) ou pelo aplicativo oficial "NFS-e Mobile".'
  }
];

export default function HelpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  const filteredFaqs = selectedCategory === 'ALL'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* CABEÇALHO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Central de Inteligência Contábil</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Guia Prático Anti-Desenquadramento & Legislação MEI
            </h1>
            <p className="text-sm text-slate-300">
              Aprenda como manter seu CNPJ 100% regular perante a Receita Federal, evitar multas e pagar o menor imposto dentro da lei.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center space-x-3 shrink-0">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-slate-200">Em conformidade com a</p>
              <p className="text-sm font-black text-white">LC 123/2006 & Res. CGSN 140/2018</p>
            </div>
          </div>
        </div>

        {/* 4 PILARES DA SEGURANÇA FISCAL DO MEI */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Os 4 Pilares para Nunca Ser Desenquadrado pela Receita Federal</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Pilar 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Teto do Faturamento (R$ 81k)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitore o teto acumulado mês a mês. No primeiro ano de empresa, respeite o limite proporcional de R$ 6.750,00/mês.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trava de Compras (80%)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nunca compre mais do que 80% do valor da sua receita no ano. Compras excessivas acionam cruzamento fiscal do Fisco Estadual.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Imposto DAS e DASN-SIMEI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pague a guia DAS mensal todo dia 20 e entregue a Declaração Anual (DASN-SIMEI) até 31 de maio para manter o CNPJ Ativo.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Separação PJ vs PF & IRPF</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guarde os comprovantes de despesas e use a regra da isenção presumida (32% serviços / 8% comércio) ao declarar IRPF na pessoa física.
              </p>
            </div>

          </div>
        </div>

        {/* FAQ SEÇÃO COM FILTROS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Perguntas Frequentes & Dúvidas Contábeis</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Respostas diretas fundamentadas na legislação da Receita Federal.
              </p>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Todas' },
                { id: 'DESENQUADRAMENTO', label: 'Desenquadramento' },
                { id: 'IRPF', label: 'IRPF Pessoa Física' },
                { id: 'DAS', label: 'DAS & Declaração' },
                { id: 'NFSE', label: 'NFS-e Nacional' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE ACCORDION FAQ */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PORTAIS OFICIAIS DO GOVERNO */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Portais Oficiais da Receita Federal & Gov.br</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                emoji: "🏛️",
                title: "PGMEI — Pagar DAS",
                description: "Gere ou pague o boleto DAS do mês. Consulte débitos em aberto e obtenha o código de autenticação após o pagamento.",
                url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
                color: "indigo",
              },
              {
                emoji: "📄",
                title: "DASN-SIMEI — Declaração Anual",
                description: "Entregue a Declaração Anual de Faturamento do MEI. Prazo: 31 de Maio de cada ano. Obrigatório.",
                url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATBHE/dasnsimeirf.app/Identificacao",
                color: "emerald",
              },
              {
                emoji: "🧾",
                title: "NFS-e — Emitir Nota Fiscal",
                description: "Emissor Nacional de NFS-e obrigatório desde Setembro/2023 para todos os MEIs prestadores de serviço.",
                url: "https://www.nfse.gov.br/EmissorNacional/Login",
                color: "purple",
              },
              {
                emoji: "📊",
                title: "Portal Simples Nacional",
                description: "Consulte sua situação no Simples Nacional, parcelamentos, certidões e eventos da empresa.",
                url: "https://www8.receita.fazenda.gov.br/SimplesNacional",
                color: "blue",
              },
              {
                emoji: "🔍",
                title: "Consulta CNPJ — Receita Federal",
                description: "Verifique a situação cadastral do seu CNPJ MEI, sócios, atividades e endereço registrado.",
                url: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/consultas/dados-publicos-cnpj",
                color: "amber",
              },
              {
                emoji: "🏦",
                title: "PARCELAMENTO — Débitos MEI",
                description: "Parcele dívidas do DAS em atraso pelo PGMEI. Permite parcelamento em até 60 meses com juros SELIC.",
                url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
                color: "rose",
              },
            ].map((portal) => (
              <a
                key={portal.title}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-${portal.color}-300 dark:hover:border-${portal.color}-700 hover:shadow-lg transition-all space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{portal.emoji}</span>
                  <ExternalLink className={`w-4 h-4 text-slate-400 group-hover:text-${portal.color}-500 transition-colors`} />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">{portal.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{portal.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* LINKS ÚTEIS E SUPORTE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Precisa emitir sua NFS-e oficial ou tirar o boleto DAS?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acesse o módulo de configurações do seu CNPJ MEI no sistema.</p>
            </div>
          </div>

          <a
            href="/settings"
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0 flex items-center space-x-2"
          >
            <span>Ir para Meu CNPJ MEI</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </Layout>
  );
}
