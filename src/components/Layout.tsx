'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from 'next-themes'
import MeiOnboarding from '@/components/MeiOnboarding'
import { 
  LayoutDashboard, 
  Landmark, 
  Receipt, 
  Users, 
  Briefcase, 
  FileCheck2, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Sparkles,
  Building2,
  HelpCircle,
  ChevronRight
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Detecta usuário sem CNPJ cadastrado e exibe onboarding
  useEffect(() => {
    if (session?.user && !(session.user as any).cpfCnpj) {
      setShowOnboarding(true)
    }
  }, [session])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Fiscal & DAS', href: '/fiscal', icon: Landmark },
    { name: 'Transações', href: '/transactions', icon: Receipt },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Serviços', href: '/services', icon: Briefcase },
    { name: 'Recibos', href: '/receipts', icon: FileCheck2 },
    { name: 'Meu CNPJ MEI', href: '/settings', icon: Building2 },
    { name: 'Ajuda & Guia MEI', href: '/help', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-20 lg:pb-0">

      {/* ONBOARDING OBRIGATÓRIO — exibido na primeira entrada sem CNPJ */}
      {showOnboarding && (
        <MeiOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
      
      {/* SIDEBAR FIXA (DESKTOP & TABLET GRANDE) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between shadow-2xl lg:shadow-none`}>
        
        <div>
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 dark:border-slate-800">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  MEI Fácil
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gestão Contábil</span>
              </div>
            </Link>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="mt-6 px-4">
            <ul className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-80" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* User Profile & Theme Switcher Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
          {/* Upgrade Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Plano PRO MEI</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
              Ativo
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                {session?.user?.name ? session.user.name[0].toUpperCase() : 'M'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{session?.user?.name || 'MEI Empreendedor'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{session?.user?.email || 'mei@meifacil.com'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Alternar Tema Claro/Escuro"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => signOut()}
                title="Sair"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* HEADER SUPERIOR (DESKTOP & MOBILE) */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Mobile Drawer Trigger & Title */}
              <div className="flex items-center space-x-3 lg:hidden">
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  MEI Fácil
                </span>
              </div>

              {/* Status Badge Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <span className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CNPJ Regular (SIMEI)</span>
                </span>
              </div>
              
              {/* Header Right Tools */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{session?.user?.name || 'MEI Empreendedor'}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Teto R$ 81.000,00</p>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* MAIN CONTENT WRAPPER */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* OVERLAY PARA MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* BOTTOM NAVIGATION BAR PARA SMARTPHONES (MOBILE REVOLUTION) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2">
        <div className="flex items-center justify-around">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
