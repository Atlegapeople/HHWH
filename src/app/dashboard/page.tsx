'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/loading'

export default function DashboardRedirectPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.replace('/auth/login')
      } else {
        // User authenticated, redirect to appropriate dashboard
        switch (userRole) {
          case 'doctor':
            router.replace('/doctor/dashboard')
            break
          case 'admin':
            router.replace('/admin/dashboard')
            break
          default:
            router.replace('/patient/dashboard')
            break
        }
      }
    }
  }, [user, userRole, loading, router])

  return (
    <LoadingScreen
      title="Redirecting to Dashboard"
      subtitle="Taking you to the right place..."
    />
  )
}