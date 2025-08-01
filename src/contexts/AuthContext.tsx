'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type UserRole = 'patient' | 'doctor' | 'admin'

interface AuthUser extends User {
  role?: UserRole
  doctor_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  userRole: UserRole | null
  isDoctor: boolean
  isPatient: boolean
  doctorProfile: any | null
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  getDoctorProfile: () => Promise<any | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<any | null>(null)
  const [isProcessingAuthChange, setIsProcessingAuthChange] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Helper function to clear all cached profile data
  const clearCachedData = () => {
    setDoctorProfile(null)
    // Add any other role-specific cached data clearing here
  }

  // Helper function to get user role and profile
  const getUserRoleAndProfile = async (user: User) => {
    const role = user.user_metadata?.role as UserRole || 'patient'
    setUserRole(role)
    
    // Clear any existing cached profiles when role changes
    setDoctorProfile(null)
    
    if (role === 'doctor') {
      // Get doctor profile
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!error && doctor) {
        setDoctorProfile(doctor)
        return { ...user, role, doctor_id: doctor.id } as AuthUser
      }
    }
    
    return { ...user, role } as AuthUser
  }

  // Helper function for role-based redirects
  const handleAuthRedirect = async (event: string, session: Session | null) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Don't redirect if user is actively in registration process
      const currentPath = window.location.pathname
      const isInRegistration = currentPath.includes('/register') || 
                               currentPath.includes('/patient/register') ||
                               currentPath.includes('/doctor/register') ||
                               currentPath.includes('/admin/register')
      
      if (isInRegistration) {
        console.log('User is in registration, skipping auto-redirect')
        return
      }
      
      const role = session.user.user_metadata?.role as UserRole || 'patient'
      
      switch (role) {
        case 'doctor':
          router.push('/doctor/dashboard')
          break
        case 'admin':
          router.push('/admin/dashboard')
          break
        default:
          router.push('/patient/dashboard')
          break
      }
    } else if (event === 'SIGNED_OUT') {
      setUserRole(null)
      setDoctorProfile(null)
      router.push('/')
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session?.user) {
          // Clear any cached data before getting profile
          clearCachedData()
          const authUser = await getUserRoleAndProfile(session.user)
          setUser(authUser)
        } else {
          setUser(null)
          setUserRole(null)
          clearCachedData()
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Prevent overlapping auth state changes
        if (isProcessingAuthChange) {
          console.log('Auth state change already in progress, skipping...')
          return
        }
        
        setIsProcessingAuthChange(true)
        console.log('Auth state changed:', event, session?.user?.email)
        
        try {
          setSession(session)
          
          if (session?.user) {
            // Clear any cached data before getting new profile
            clearCachedData()
            const authUser = await getUserRoleAndProfile(session.user)
            setUser(authUser)
          } else {
            setUser(null)
            setUserRole(null)
            clearCachedData()
          }
          
          await handleAuthRedirect(event, session)
        } catch (error) {
          console.error('Error processing auth state change:', error)
        } finally {
          setIsProcessingAuthChange(false)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth, isProcessingAuthChange])

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    // Clear all cached data before signing out
    clearCachedData()
    setUser(null)
    setUserRole(null)
    setSession(null)
    
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const getDoctorProfile = async () => {
    if (!user || userRole !== 'doctor') return null
    
    // Validate cached profile matches current user
    if (doctorProfile && doctorProfile.user_id === user.id) {
      return doctorProfile
    }
    
    // Clear any stale cached data and fetch fresh profile
    setDoctorProfile(null)
    
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (!error && doctor) {
      setDoctorProfile(doctor)
      return doctor
    }
    
    return null
  }

  const value = {
    user,
    session,
    loading,
    userRole,
    isDoctor: userRole === 'doctor',
    isPatient: userRole === 'patient',
    doctorProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    getDoctorProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}