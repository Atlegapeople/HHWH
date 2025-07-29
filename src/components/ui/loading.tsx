'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  className?: string
}

interface LoadingSkeletonProps {
  className?: string
  width?: string
  height?: string
}

// Modern loading spinner with dual rings
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const borderSizes = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-slate-200',
        sizeClasses[size],
        borderSizes[size]
      )}></div>
      <div className={cn(
        'animate-spin rounded-full border-transparent border-t-[#217B82] absolute inset-0',
        sizeClasses[size],
        borderSizes[size]
      )}></div>
    </div>
  )
}

// Full-screen loading component
export function LoadingScreen({ 
  title = "Loading", 
  subtitle = "Please wait...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "fixed inset-0 min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center z-50",
      className
    )}>
      <div className="text-center px-4 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <LoadingSpinner size="xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 animate-pulse">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// Loading card for inline loading states
export function LoadingCard({ 
  title = "Loading", 
  subtitle = "Please wait...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "w-full max-w-md mx-auto bg-white border-0 shadow-xl rounded-xl p-8 text-center",
      className
    )}>
      <LoadingSpinner size="lg" className="mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 animate-pulse">{subtitle}</p>
    </div>
  )
}

// Skeleton loading for content placeholders
export function LoadingSkeleton({ 
  className, 
  width = "100%", 
  height = "1rem" 
}: LoadingSkeletonProps) {
  return (
    <div 
      className={cn("bg-slate-200 rounded-lg animate-pulse", className)}
      style={{ width, height }}
    />
  )
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button 
      className={cn("relative", className)} 
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}

// Page loading with progress
export function LoadingProgress({ 
  progress = 0,
  title = "Loading",
  subtitle = "Please wait..."
}: {
  progress?: number
  title?: string
  subtitle?: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
      <div className="text-center max-w-md w-full px-6">
        <LoadingSpinner size="xl" className="mx-auto mb-6" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 mb-4">{subtitle}</p>
        
        {progress > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-[#217B82] to-[#1a6b72] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        
        {progress > 0 && (
          <p className="text-sm text-slate-500">{Math.round(progress)}% complete</p>
        )}
      </div>
    </div>
  )
}