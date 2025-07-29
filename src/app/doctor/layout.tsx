'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppointmentService } from '@/lib/supabase/appointments'
import { 
  Calendar, 
  Users, 
  Settings, 
  Home,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  FileText,
  TrendingUp,
  Heart,
  Activity,
  MessageSquare,
  CreditCard,
  User
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

interface DoctorLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/doctor/dashboard',
    icon: Home,
    description: 'Overview & analytics',
    color: 'brand-blue'
  },
  {
    name: 'Appointments',
    href: '/doctor/appointments',
    icon: Calendar,
    description: 'Manage consultations',
    color: 'brand-green'
  },
  {
    name: 'Patients',
    href: '/doctor/patients',
    icon: Users,
    description: 'Patient records',
    color: 'brand-purple'
  },
  {
    name: 'Reports',
    href: '/doctor/reports',
    icon: TrendingUp,
    description: 'Analytics & insights',
    color: 'brand-amber'
  },
  {
    name: 'Messages',
    href: '/doctor/messages',
    icon: MessageSquare,
    description: 'Patient communications',
    color: 'brand-green'
  },
  {
    name: 'Profile',
    href: '/doctor/profile',
    icon: User,
    description: 'Account settings',
    color: 'brand-blue'
  }
]

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [todayAppointments, setTodayAppointments] = useState(0)
  const [doctorRating, setDoctorRating] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [currentDoctorProfile, setCurrentDoctorProfile] = useState<any>(null)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const pathname = usePathname()
  const { user, doctorProfile, signOut, getDoctorProfile } = useAuth()

  // Get doctor ID from authenticated user
  const doctorId = user?.id || null
  
  // Cache duration: 1 minute (60000ms)
  const CACHE_DURATION = 60000

  useEffect(() => {
    const loadDoctorData = async () => {
      if (!doctorId) return // Don't load if no user ID
      
      // Check if we need to fetch data (cache check)
      const now = Date.now()
      if (now - lastFetchTime < CACHE_DURATION && currentDoctorProfile && !isLoadingStats) {
        console.log('Using cached data, skipping fetch')
        return
      }

      try {
        console.log('Loading doctor data for user:', doctorId)
        setIsLoadingStats(true)
        
        // Use the main profile API instead of the individual one
        const response = await fetch('/api/doctors/profile')
        if (response.ok) {
          const data = await response.json()
          const profile = data.profile
          console.log('Got doctor profile from API:', profile)
          
          setCurrentDoctorProfile(profile)
          
          if (profile) {
            // Get today's date
            const today = new Date().toISOString().split('T')[0]
            
            // Fetch today's appointments using the profile's doctor ID
            const appointmentService = new AppointmentService()
            const todayAppts = await appointmentService.getDoctorAppointments(profile.id, today)
            
            setTodayAppointments(todayAppts.length)
          }
          
          // Calculate average rating (mock data for now - would be from reviews table)
          setDoctorRating(4.8)
          
          // Update last fetch time
          setLastFetchTime(now)
        } else {
          console.error('Failed to fetch doctor profile')
        }
        
      } catch (error) {
        console.error('Error loading doctor data:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    // Load data on component mount
    loadDoctorData()

    // Set up periodic refresh every minute
    const interval = setInterval(() => {
      console.log('Periodic refresh triggered')
      loadDoctorData()
    }, CACHE_DURATION)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [doctorId]) // Depend on doctorId so it reloads when user changes

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']} redirectTo="/auth/doctor/login">
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
        fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white via-white to-brand-blue/5 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-brand-blue/10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-brand-blue/10 lg:hidden">
            <span className="font-heading font-bold text-foreground">Doctor Portal</span>
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
          <div className="hidden lg:flex h-20 items-center px-6 border-b border-brand-blue/10">
            <h2 className="font-heading font-bold text-xl text-foreground">Doctor Portal</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Navigation</p>
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand-blue to-brand-green shadow-lg shadow-brand-blue/25' 
                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-brand-blue/5 hover:shadow-md'
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
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-green/20 opacity-50"></div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-brand-blue/10 bg-gradient-to-r from-brand-blue/5 to-brand-green/5 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-blue rounded-2xl flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {currentDoctorProfile?.full_name ? (
                  <p className="font-semibold text-foreground truncate">
                    Dr. {currentDoctorProfile.full_name}
                  </p>
                ) : isLoadingStats ? (
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="font-semibold text-foreground truncate">
                    {user?.email ? `Dr. ${user.email.split('@')[0]}` : 'Doctor'}
                  </p>
                )}
                
                {currentDoctorProfile?.specialization ? (
                  <p className="text-sm text-brand-blue truncate">
                    {currentDoctorProfile.specialization}
                  </p>
                ) : isLoadingStats ? (
                  <div className="w-20 h-3 bg-brand-blue/20 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-sm text-brand-blue truncate">
                    Specialist Doctor
                  </p>
                )}
                
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                  <span className="text-xs text-brand-green font-medium">Online</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-brand-blue/10 group hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-blue group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs text-muted-foreground">Today</p>
                    {isLoadingStats ? (
                      <div className="w-4 h-4 bg-brand-blue/20 rounded animate-pulse"></div>
                    ) : (
                      <p className="font-bold text-brand-blue text-lg">
                        {todayAppointments}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-brand-green/10 group hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-green group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    {isLoadingStats ? (
                      <div className="w-6 h-4 bg-brand-green/20 rounded animate-pulse"></div>
                    ) : (
                      <p className="font-bold text-brand-green text-lg">
                        {doctorRating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start border-brand-red/20 text-brand-red hover:bg-brand-red/10 hover:border-brand-red/30 transition-all duration-300"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu button - only show on mobile when sidebar is hidden */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-white to-brand-blue/5 border-b border-brand-blue/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-brand-blue/10 text-brand-blue"
          >
            <Menu className="h-5 w-5" />
            <span className="ml-2 font-medium">Menu</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative hover:bg-brand-amber/10">
              <Bell className="h-5 w-5 text-brand-amber" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-brand-red text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-blue rounded-2xl flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  )
}