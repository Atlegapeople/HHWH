'use client'

import { usePathname } from 'next/navigation'
import PortalNavigation from './PortalNavigation'
import Navbar from '@/components/layout/Navbar'

export default function ConditionalNavigation() {
  const pathname = usePathname()

  // Don't show any navigation on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  // Use old navbar for specific pages that might need it
  // For now, let's use the new PortalNavigation everywhere except auth pages
  
  // Determine current portal based on pathname
  let currentPortal: 'home' | 'patient' | 'doctor' | 'admin' = 'home'
  
  if (pathname.startsWith('/patient')) {
    currentPortal = 'patient'
  } else if (pathname.startsWith('/doctor')) {
    currentPortal = 'doctor'
  } else if (pathname.startsWith('/admin')) {
    currentPortal = 'admin'
  }

  return <PortalNavigation currentPortal={currentPortal} />
}