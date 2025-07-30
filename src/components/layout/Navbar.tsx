'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
  Heart,
  Home,
  Info,
  Stethoscope,
  UserCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Handle mobile menu close on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Fetch user's profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user) {
        setProfilePhoto(null)
        return
      }

      try {
        const { data: patient, error } = await supabase
          .from('patients')
          .select('profile_photo_url')
          .eq('email', user.email)
          .single()

        if (error) {
          // Silently handle the case where patient record doesn't exist or no photo is uploaded
          // This is expected behavior when a user hasn't completed their profile yet
          if (error.code === 'PGRST116') {
            // No rows returned - patient record doesn't exist yet
            setProfilePhoto(null)
            return
          }
          // Only log unexpected errors
          console.warn('Unexpected error fetching profile photo:', error.message)
          setProfilePhoto(null)
          return
        }

        setProfilePhoto(patient?.profile_photo_url || null)
      } catch (error) {
        // Only log unexpected errors, not profile photo not found
        console.warn('Unexpected error in profile photo fetch:', error)
        setProfilePhoto(null)
      }
    }

    fetchProfilePhoto()
  }, [user, supabase])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center py-2">
            <Image 
              src="/images/Logo-HHWH.png" 
              alt="HHWH Online Clinic" 
              width={180} 
              height={58}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/"
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-slate-100/80 ${
                isActive('/') 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              {isActive('/') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/about"
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-slate-100/80 ${
                isActive('/about') 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
              {isActive('/about') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/services"
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-slate-100/80 ${
                isActive('/services') 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Services</span>
              {isActive('/services') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/patient"
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:shadow-sm ${
                isActive('/patient') || pathname.startsWith('/patient')
                  ? 'text-white bg-gradient-to-r from-[#217B82] to-[#1a6b72] shadow-lg shadow-[#217B82]/25' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCircle className="h-4 w-4" />
              <span>Patient Portal</span>
              {(isActive('/patient') || pathname.startsWith('/patient')) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
                <div className="hidden md:block">
                  <div className="w-20 h-3 bg-slate-200 rounded-full animate-pulse mb-1"></div>
                  <div className="w-12 h-2 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-slate-100/80 transition-all duration-300">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profilePhoto || undefined} alt="Profile photo" />
                      <AvatarFallback className="bg-gradient-to-br from-[#217B82] to-[#1a6b72] text-white text-xs">
                        {getInitials(user.user_metadata?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profilePhoto || undefined} alt="Profile photo" />
                        <AvatarFallback className="bg-gradient-to-br from-[#217B82] to-[#1a6b72] text-white text-sm">
                          {getInitials(user.user_metadata?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-foreground">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <Link href="/patient/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100/80 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#217B82]/10">
                        <User className="h-4 w-4 text-[#217B82]" />
                      </div>
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patient/book-appointment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100/80 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">Book Appointment</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patient/assessment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100/80 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Health Assessment</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100/80 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10">
                        <Settings className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 focus:text-red-600"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="px-4 py-2 rounded-xl hover:bg-slate-100/80 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#217B82] to-[#1a6b72] hover:from-[#1a6b72] hover:to-[#217B82] text-white shadow-lg shadow-[#217B82]/25 hover:shadow-xl hover:shadow-[#217B82]/30 transition-all duration-300" size="sm">
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
          <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                href="/about"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/about') 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
              <Link 
                href="/services"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/services') 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Services</span>
              </Link>
              <Link 
                href="/patient"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/patient') || pathname.startsWith('/patient')
                    ? 'text-white bg-gradient-to-r from-[#217B82] to-[#1a6b72] shadow-lg shadow-[#217B82]/25' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircle className="h-4 w-4" />
                <span>Patient Portal</span>
              </Link>

              <div className="border-t pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profilePhoto || undefined} alt="Profile photo" />
                        <AvatarFallback className="bg-[#217B82]/10 text-[#217B82] text-xs">
                          {getInitials(user.user_metadata?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
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
                        href="/patient/dashboard"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-[#217B82]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link 
                        href="/patient/book-appointment"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-[#217B82]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Appointment</span>
                      </Link>
                      <Link 
                        href="/patient/assessment"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-[#217B82]"
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
                      <Button className="w-full bg-gradient-to-r from-[#217B82] to-[#1a6b72] hover:from-[#1a6b72] hover:to-[#217B82] text-white shadow-lg shadow-[#217B82]/25 hover:shadow-xl hover:shadow-[#217B82]/30 transition-all duration-300" size="sm">
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