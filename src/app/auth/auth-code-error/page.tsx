'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Error Message */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="font-heading text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                The authentication link appears to be invalid or has expired. 
                This can happen if you&apos;ve already used the link or if too much time has passed.
              </p>
            </div>
            
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="btn-healthcare-primary w-full">
                  Try Sign In Again
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <Link href="mailto:support@hhwh.co.za" className="text-brand-blue hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}