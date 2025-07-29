'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home,
  Users,
  Stethoscope, 
  Shield,
  Menu,
  ChevronDown,
  Heart,
  Phone,
  Mail,
  MapPin,
  LogOut,
  User
} from 'lucide-react'

interface PortalNavigationProps {
  currentPortal?: 'home' | 'patient' | 'doctor' | 'admin'
  className?: string
}

const portals = [
  {
    name: 'Patient Portal',
    description: 'Book appointments, manage health',
    href: '/patient/dashboard',
    loginHref: '/auth/login',
    icon: Users,
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10'
  },
  {
    name: 'Doctor Portal',
    description: 'Manage patients, consultations',
    href: '/doctor/dashboard',
    loginHref: '/auth/doctor/login',
    icon: Stethoscope,
    color: 'text-brand-green',
    bgColor: 'bg-brand-green/10'
  },
  {
    name: 'Admin Portal',
    description: 'System administration',
    href: '/admin/dashboard',
    loginHref: '/auth/admin/login',
    icon: Shield,
    color: 'text-brand-red',
    bgColor: 'bg-brand-red/10'
  }
]

export default function PortalNavigation({ currentPortal = 'home', className = '' }: PortalNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userRole, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handlePortalAccess = (portal: 'patient' | 'doctor' | 'admin') => {
    if (user) {
      // User is signed in, check their role and redirect appropriately
      if (portal === 'patient') {
        if (userRole === 'patient' || !userRole) {
          router.push('/patient/dashboard')
        } else {
          // User has different role, redirect to login
          router.push('/auth/login')
        }
      } else if (portal === 'doctor') {
        if (userRole === 'doctor') {
          router.push('/doctor/dashboard')
        } else {
          router.push('/auth/doctor/login')
        }
      } else if (portal === 'admin') {
        if (userRole === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/auth/admin/login')
        }
      }
    } else {
      // User not signed in, redirect to appropriate login
      if (portal === 'patient') {
        router.push('/auth/login')
      } else if (portal === 'doctor') {
        router.push('/auth/doctor/login')
      } else if (portal === 'admin') {
        router.push('/auth/admin/login')
      }
    }
  }

  return (
    <header className={`bg-white/98 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Home Link */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/images/Logo-HHWH.png" 
              alt="HHWH Online Clinic" 
              width={160} 
              height={52}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Home Link */}
            <Link 
              href="/" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentPortal === 'home' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {/* Portal Links */}
            {portals.map((portal) => {
              const Icon = portal.icon
              const isActive = currentPortal === portal.name.toLowerCase().split(' ')[0] as any
              
              return (
                <DropdownMenu key={portal.name}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`flex items-center space-x-2 ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${portal.color}`} />
                      <span>{portal.name}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{portal.name}</p>
                      <p className="text-xs text-gray-500">{portal.description}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handlePortalAccess(portal.name.toLowerCase().split(' ')[0] as 'patient' | 'doctor' | 'admin')}
                      className="flex items-center cursor-pointer"
                    >
                      <Icon className={`mr-2 h-4 w-4 ${portal.color}`} />
                      {portal.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={portal.loginHref} className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        Sign In / Register
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}
          </nav>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {/* Contact Info (Desktop) */}
            <div className="hidden xl:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>0800 HHWH (4494)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>hello@hhwh.co.za</span>
              </div>
            </div>

            {/* User Menu (Desktop) */}
            {user && (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {userRole && (
                        <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (userRole === 'patient') router.push('/patient/dashboard')
                        else if (userRole === 'doctor') router.push('/doctor/dashboard')
                        else if (userRole === 'admin') router.push('/admin/dashboard')
                      }}
                      className="flex items-center cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white">
            <div className="space-y-2">
              {/* Home Link */}
              <Link 
                href="/" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  currentPortal === 'home' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              {/* Portal Links */}
              {portals.map((portal) => {
                const Icon = portal.icon
                return (
                  <div key={portal.name} className="space-y-1">
                    <div className={`flex items-center space-x-3 px-3 py-2 ${portal.bgColor} rounded-lg`}>
                      <Icon className={`h-4 w-4 ${portal.color}`} />
                      <div>
                        <p className="font-medium text-gray-900">{portal.name}</p>
                        <p className="text-xs text-gray-600">{portal.description}</p>
                      </div>
                    </div>
                    <div className="ml-7 space-y-1">
                      <button 
                        onClick={() => {
                          handlePortalAccess(portal.name.toLowerCase().split(' ')[0] as 'patient' | 'doctor' | 'admin')
                          setMobileMenuOpen(false)
                        }}
                        className="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded text-left w-full transition-colors"
                      >
                        {portal.name}
                      </button>
                      <Link 
                        href={portal.loginHref}
                        className="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In / Register
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* User Info (Mobile) */}
              {user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="px-3 py-2 bg-gray-50/80 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {userRole && (
                          <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          if (userRole === 'patient') router.push('/patient/dashboard')
                          else if (userRole === 'doctor') router.push('/doctor/dashboard')
                          else if (userRole === 'admin') router.push('/admin/dashboard')
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <User className="h-3 w-3" />
                        <span>My Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 w-full text-left px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <LogOut className="h-3 w-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info (Mobile) */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>0800 HHWH (4494)</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>hello@hhwh.co.za</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}