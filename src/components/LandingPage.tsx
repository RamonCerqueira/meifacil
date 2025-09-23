import { useState } from 'react'
import { Check, Star, ArrowRight, Shield, Zap, TrendingUp, Users, FileText, DollarSign } from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
  onRegister: () => void
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Acompanhe receitas e despesas em tempo real com relatórios automáticos'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastre e organize seus clientes de forma simples e profissional'
    },
    {
      icon: FileText,
      title: 'Recibos Profissionais',
      description: 'Gere recibos em PDF com sua marca em segundos'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Inteligentes',
      description: 'Visualize o crescimento do seu negócio com gráficos e métricas'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de nível bancário'
    },
    {
      icon: Zap,
      title: 'Fácil de Usar',
      description: 'Interface intuitiva que qualquer MEI consegue usar sem complicação'
    }
  ]

  const testimonials = [
    {
      name: 'João Silva',
      role: 'Designer Freelancer',
      content: 'O MEI Fácil transformou minha gestão financeira. Agora consigo focar no que realmente importa: meus clientes!',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'Consultora de Marketing',
      content: 'Finalmente um sistema que entende as necessidades do MEI. Simples, rápido e profissional.',
      rating: 5
    },
    {
      name: 'Carlos Oliveira',
      role: 'Desenvolvedor',
      content: 'Economizo 5 horas por semana na gestão financeira. O ROI foi imediato!',
      rating: 5
    }
  ]

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 10 clientes',
        'Até 20 transações/mês',
        'Recibos básicos',
        'Suporte por email'
      ],
      cta: 'Começar Grátis',
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 29,99',
      period: '/mês',
      description: 'Para MEIs que querem crescer',
      features: [
        'Clientes ilimitados',
        'Transações ilimitadas',
        'Recibos personalizados',
        'Relatórios avançados',
        'Suporte prioritário',
        'Backup automático'
      ],
      cta: 'Começar Teste Grátis',
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MEI Fácil
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onLogin}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={onRegister}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão Financeira
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simples para MEIs
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Organize suas finanças, gerencie clientes e gere recibos profissionais 
              em uma plataforma feita especialmente para MEIs e Freelancers brasileiros.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-6 py-4 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
                <button
                  onClick={onRegister}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-r-xl transition-all flex items-center"
                >
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Grátis para começar
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Funcionalidades pensadas especialmente para MEIs e Freelancers brasileiros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mais de 1.000 MEIs já confiam no MEI Fácil
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que nossos usuários estão dizendo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e evolua conforme seu negócio cresce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 transform scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full inline-block mb-4">
                    Mais Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onRegister}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de MEIs que já estão organizando suas finanças 
            e fazendo seus negócios crescerem com o MEI Fácil.
          </p>
          <button
            onClick={onRegister}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Começar Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                MEI Fácil
              </h3>
              <p className="text-gray-400">
                A plataforma de gestão financeira feita especialmente para MEIs brasileiros.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MEI Fácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

