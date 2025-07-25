import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
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

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      specialization,
      qualification,
      hpcsa_number,
      consultation_fee,
      bio,
      practice_address
    } = await request.json()

    console.log('Doctor registration request:', { email, full_name, specialization })

    // Step 1: Create auth user with doctor role
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: 'doctor',
        full_name,
        phone
      },
      email_confirm: true // Auto-confirm email for now
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account', details: authError.message },
        { status: 400 }
      )
    }

    console.log('Auth user created:', authUser.user.id)

    // Step 2: Create doctor profile
    const { data: doctorProfile, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({
        user_id: authUser.user.id,
        full_name,
        email,
        phone,
        specialization,
        qualification,
        hpcsa_number,
        consultation_fee: Number(consultation_fee),
        bio,
        practice_address,
        is_active: false // Requires admin approval
      })
      .select()
      .single()

    if (doctorError) {
      console.error('Doctor profile creation failed:', doctorError)
      
      // Clean up: delete the auth user if doctor profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create doctor profile', details: doctorError.message },
        { status: 400 }
      )
    }

    console.log('Doctor profile created:', doctorProfile.id)

    return NextResponse.json({
      success: true,
      message: 'Doctor registration successful',
      doctor: {
        id: doctorProfile.id,
        user_id: authUser.user.id,
        full_name,
        email: authUser.user.email,
        specialization,
        is_active: false
      }
    })

  } catch (error) {
    console.error('Doctor registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}