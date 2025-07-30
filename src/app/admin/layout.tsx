'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserCheck,
  BarChart3,
  Settings, 
  Home,
  Bell,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    description: 'System overview',
    color: 'brand-blue'
  },
  {
    name: 'Doctor Applications',
    href: '/admin/doctors',
    icon: UserCheck,
    description: 'Review applications',
    color: 'brand-amber'
  },
  {
    name: 'All Doctors',
    href: '/admin/doctors/active',
    icon: Users,
    description: 'Manage active doctors',
    color: 'brand-green'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'System insights',
    color: 'brand-blue'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
    color: 'brand-red'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth/admin/login">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white via-white to-brand-red/5 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-brand-red/10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col">
            {/* Mobile close button */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-brand-red/10 lg:hidden">
              <span className="font-heading font-bold text-foreground">Admin Portal</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-brand-red/10 text-brand-red"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Desktop header */}
            <div className="hidden lg:flex h-20 items-center px-6 border-b border-brand-red/10">
              <h2 className="font-heading font-bold text-xl text-foreground">Admin Portal</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Administration</p>
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    
                    return (
                      <Link key={item.name} href={item.href}>
                        <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-brand-red to-brand-red shadow-lg shadow-brand-red/25' 
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-brand-red/5 hover:shadow-md'
                        }`}>
                          <div className="flex items-center p-4 relative z-10">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? 'bg-white/20 backdrop-blur-sm' 
                                : `bg-${item.color}/10 group-hover:bg-${item.color}/20 group-hover:scale-110`
                            }`}>
                              <Icon className={`h-5 w-5 transition-colors duration-300 ${
                                isActive 
                                  ? 'text-white' 
                                  : `text-${item.color} group-hover:text-${item.color}`
                              }`} />
                            </div>
                            <div className="ml-4 flex-1">
                              <p className={`font-semibold transition-colors duration-300 ${
                                isActive 
                                  ? 'text-white' 
                                  : 'text-foreground group-hover:text-foreground'
                              }`}>
                                {item.name}
                              </p>
                              <p className={`text-xs transition-colors duration-300 ${
                                isActive 
                                  ? 'text-white/80' 
                                  : 'text-muted-foreground group-hover:text-muted-foreground'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            {isActive && (
                              <div className="w-1 h-8 bg-white/50 rounded-full absolute right-2"></div>
                            )}
                          </div>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-brand-red/20 opacity-50"></div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </nav>

            {/* User section */}
            <div className="border-t border-brand-red/10 p-4 mt-auto">
              <div className="bg-gradient-to-r from-brand-red/5 to-brand-red/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-red to-brand-red rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      Admin User
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      System Administrator
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-brand-red/20 hover:bg-brand-red/10 hover:border-brand-red/30 text-brand-red"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-brand-red/10 text-brand-red"
              >
                <Menu className="h-5 w-5" />
                <span className="ml-2 font-medium">Admin Menu</span>
              </Button>
              <h1 className="font-heading font-bold text-lg text-foreground">Admin Portal</h1>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-brand-red/5">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}