import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Admin registration code - should be set as environment variable in production
const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || 'HHWH_ADMIN_2024'

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, password, admin_code } = await request.json()

    // Validate required fields
    if (!full_name || !email || !password || !admin_code) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate admin code
    if (admin_code !== ADMIN_REGISTRATION_CODE) {
      return NextResponse.json(
        { error: 'Invalid administrator code' },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user with this email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUser.users.some(user => user.email === email)

    if (emailExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create admin user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm admin emails
      user_metadata: {
        role: 'admin',
        full_name,
        created_by: 'admin_registration'
      }
    })

    if (authError) {
      console.error('Admin user creation failed:', authError)
      return NextResponse.json(
        { error: 'Failed to create administrator account', details: authError.message },
        { status: 400 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      )
    }

    // Create admin profile in database (optional - for extended admin data)
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        user_id: authUser.user.id,
        full_name,
        email,
        is_active: true,
        created_at: new Date().toISOString()
      })

    // Note: We don't fail if admin_profiles table doesn't exist yet
    if (profileError && profileError.message && !profileError.message.includes('does not exist')) {
      console.warn('Admin profile creation failed:', profileError)
    }

    console.log(`Administrator account created successfully for: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Administrator account created successfully',
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Admin registration endpoint is active',
    timestamp: new Date().toISOString()
  })
}