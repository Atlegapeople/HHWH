'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ResultsTestPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    console.log('ResultsTestPage mounted')
    console.log('Current pathname:', pathname)
    
    // Add a timeout to see if anything redirects us
    const timer = setTimeout(() => {
      console.log('Still on ResultsTestPage after 2 seconds')
    }, 2000)
    
    return () => {
      console.log('ResultsTestPage unmounting')
      clearTimeout(timer)
    }
  }, [pathname])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center">Assessment Results Test Page</h1>
        <p className="text-center mt-4">If you can see this, the routing is working!</p>
        <p className="text-center mt-2 text-sm text-gray-600">Current path: {pathname}</p>
        <div className="mt-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results Display</h2>
            <p>This is a test page to verify that results pages can load properly.</p>
            <p className="mt-4 text-sm text-red-600">Check console for debug info</p>
          </div>
        </div>
      </div>
    </div>
  )
}