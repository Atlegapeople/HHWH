'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateScrollProgress = () => {
      const currentScroll = window.pageYOffset
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (scrollHeight > 0) {
        const progress = (currentScroll / scrollHeight) * 100
        setScrollProgress(Math.min(progress, 100))
      }
    }

    // Update on scroll
    window.addEventListener('scroll', updateScrollProgress)
    
    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateScrollProgress)
    
    // Initial calculation
    updateScrollProgress()

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [isClient])

  // Don't show scroll progress on auth pages, doctor pages, or admin pages
  if (!isClient || 
      pathname.startsWith('/auth/') || 
      pathname.startsWith('/doctor/') || 
      pathname.startsWith('/admin/')) {
    return null
  }

  return (
    <div className="fixed top-16 left-0 right-0 h-1 bg-transparent z-40 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-green via-brand-blue to-brand-green-light transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          boxShadow: scrollProgress > 0 ? '0 2px 8px rgba(54, 132, 137, 0.4)' : 'none'
        }}
      />
    </div>
  )
}