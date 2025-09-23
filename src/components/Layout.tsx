import { useState } from 'react'
import  Link from 'next/link'
import { usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Clientes', href: '/clients', icon: '👥' },
    { name: 'Serviços', href: '/services', icon: '⚙️' },
    { name: 'Transações', href: '/transactions', icon: '💰' },
    { name: 'Recibos', href: '/receipts', icon: '📄' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <h1 className="text-2xl font-bold text-white">MEI Fácil</h1>
        </div>
        
        <nav className="mt-8 px-4">
      <ul className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Usuário</p>
                <p className="text-xs text-gray-500">Plano Free</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4 ml-auto">
                <div className="relative">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg">
                    Upgrade Pro
                  </button>
                </div>
                
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

