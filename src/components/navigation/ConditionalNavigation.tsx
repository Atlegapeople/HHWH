'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default function ConditionalNavigation() {
  const pathname = usePathname()

  // Don't show navigation on auth pages only
  if (pathname.startsWith('/auth/')) {
    return null
  }

  // Show the standard navbar on all pages including doctor/admin/patient portals
  return <Navbar />
}