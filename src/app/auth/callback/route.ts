import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // If there's a specific next parameter, use it
      if (next) {
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
      
      // Otherwise, redirect based on user role
      const userRole = data.user.user_metadata?.role || 'patient'
      let dashboardPath = '/patient/dashboard' // Default to patient
      
      switch (userRole) {
        case 'doctor':
          dashboardPath = '/doctor/dashboard'
          break
        case 'admin':
          dashboardPath = '/admin/dashboard'
          break
        default:
          dashboardPath = '/patient/dashboard'
          break
      }
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${dashboardPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${dashboardPath}`)
      } else {
        return NextResponse.redirect(`${origin}${dashboardPath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}