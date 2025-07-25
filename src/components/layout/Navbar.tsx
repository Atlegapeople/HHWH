'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  X, 
  User, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  ChevronDown,
  Activity,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  // Don't show navbar on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center py-2">
            <Image 
              src="/images/Logo-HHWH.png" 
              alt="HHWH Online Clinic" 
              width={160} 
              height={52}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                isActive('/') ? 'text-brand-purple' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                isActive('/about') ? 'text-brand-purple' : 'text-muted-foreground'
              }`}
            >
              About
            </Link>
            <Link 
              href="/services"
              className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                isActive('/services') ? 'text-brand-purple' : 'text-muted-foreground'
              }`}
            >
              Services
            </Link>
            <Link 
              href="/patient"
              className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                isActive('/patient') ? 'text-brand-purple' : 'text-muted-foreground'
              }`}
            >
              Patient Portal
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-brand-purple" />
                    </div>
                    <span className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patient/book-appointment" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patient/assessment" className="flex items-center">
                      <Activity className="mr-2 h-4 w-4" />
                      Health Assessment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="btn-healthcare-primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/"
                className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                  isActive('/') ? 'text-brand-purple' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about"
                className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                  isActive('/about') ? 'text-brand-purple' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/services"
                className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                  isActive('/services') ? 'text-brand-purple' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/patient"
                className={`text-sm font-medium transition-colors hover:text-brand-purple ${
                  isActive('/patient') ? 'text-brand-purple' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Patient Portal
              </Link>

              <div className="border-t pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-brand-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        href="/dashboard"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-brand-purple"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link 
                        href="/patient/book-appointment"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-brand-purple"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Appointment</span>
                      </Link>
                      <Link 
                        href="/patient/assessment"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-brand-purple"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Activity className="h-4 w-4" />
                        <span>Health Assessment</span>
                      </Link>
                      <Button
                        onClick={() => {
                          handleSignOut()
                          setIsMenuOpen(false)
                        }}
                        variant="ghost"
                        size="sm"
                        className="justify-start p-0 h-auto text-red-600 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="btn-healthcare-primary w-full" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}