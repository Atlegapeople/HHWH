'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('patient' | 'doctor' | 'admin')[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['patient'], 
  redirectTo = '/auth/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated
        router.push(redirectTo)
        return
      }

      if (userRole && !allowedRoles.includes(userRole)) {
        // User doesn't have the required role
        switch (userRole) {
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
        return
      }
    }
  }, [user, userRole, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gray/20"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Loading</h3>
            <p className="text-muted-foreground">Preparing your experience...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-gray/20"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
            </div>
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}